import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export const POST = async (request: NextRequest) => {
    const { userId } = await request.json()
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

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Missing parameters' }), {
            status: 400
        })
    }

    if (userId !== data.user.id) {
        return NextResponse.json(
            { error: 'Forbidden - cannot access other user data' },
            { status: 403 }
        )
    }

    try {
        const cards = await prisma.collectionEntry.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                userId: true,
                cardId: true,
                variant: true,
                condition: true,
                card: {
                    select: {
                        setId: true,
                        dexId: true
                    }
                },
                forTrade: true,
                showcase: true,
                grade: true,
                gradeLevel: true,
                tags: true
            }
        })
        return new Response(JSON.stringify({ cards }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal Server Error: ' + error }),
            {
                status: 500
            }
        )
    }
}
