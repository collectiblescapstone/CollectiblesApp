import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
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
        const userId = data.user.id

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            )
        }

        const result = await prisma.collectionEntry.findMany({
            where: {
                userId: userId,
                showcase: true
            },
            select: {
                id: true
            }
        })

        return NextResponse.json(
            {
                message: 'Number of cards in showcase retrieved successfully',
                showcaseCount: result.length,
                data: result
            },
            { status: 200 }
        )
    } catch (err) {
        console.error('collection/showcaseCount error', err)
        return NextResponse.json(
            { error: 'Internal Server Error', message: String(err) },
            { status: 500 }
        )
    }
}
