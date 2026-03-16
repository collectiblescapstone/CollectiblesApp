import prisma from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export const POST = async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Unauthorized - missing token' },
            { status: 401 }
        )
    }
    const token = authHeader.substring(7)
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
        return NextResponse.json(
            { error: 'Unauthorized - invalid token' },
            { status: 401 }
        )
    }

    const { username, rating, currentUserId } = await request.json()

    if (currentUserId !== data.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isValidRating =
        typeof rating === 'number' &&
        rating >= 0 &&
        rating <= 5 &&
        rating % 0.5 === 0

    if (!username || rating === undefined || !isValidRating) {
        return NextResponse.json(
            { error: 'Invalid values provided' },
            { status: 400 }
        )
    }

    const user = await prisma.user.findUnique({
        where: { username: username },
        select: {
            id: true,
            rating: true,
            rating_count: true
        }
    })

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.id === currentUserId) {
        return NextResponse.json(
            { error: 'Users cannot rate themselves' },
            { status: 400 }
        )
    }

    const newRatingCount = user.rating_count + 1
    const newRating =
        (user.rating * user.rating_count + rating) / newRatingCount

    await prisma.user.update({
        where: { id: user.id },
        data: {
            rating: newRating,
            rating_count: newRatingCount
        }
    })

    return NextResponse.json({ message: 'Rating submitted successfully' })
}
