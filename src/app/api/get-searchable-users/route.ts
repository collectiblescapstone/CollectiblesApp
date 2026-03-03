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

        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: userId
                },
                visibility: 'public'
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profile_pic: true,
                rating: true,
                rating_count: true,
                location: true
            }
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Error in get-searchable-users API:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
