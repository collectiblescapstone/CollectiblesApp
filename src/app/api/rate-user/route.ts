import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
    const { username, rating, currentUserId } = await request.json()

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
