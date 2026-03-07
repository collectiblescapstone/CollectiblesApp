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

        const body = await request.json()
        const { cardId } = body

        if (!userId && !cardId) {
            return NextResponse.json(
                { error: 'cardName or cardId is required' },
                { status: 400 }
            )
        }

        const result = await prisma.collectionEntry.findFirst({
            where: {
                id: cardId,
                userId: userId
            }
        })

        return NextResponse.json(
            { message: 'Collection card retrieved', data: result },
            { status: 200 }
        )
    } catch (err) {
        console.error('collection/save error', err)
        return NextResponse.json(
            { error: 'Internal Server Error', message: String(err) },
            { status: 500 }
        )
    }
}
