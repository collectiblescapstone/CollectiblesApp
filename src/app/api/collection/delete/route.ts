import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
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
        const { entryId } = body

        if (!entryId) {
            return NextResponse.json(
                { error: 'entryId is required' },
                { status: 400 }
            )
        }

        // Delete directly - single query instead of find + delete
        const result = await prisma.collectionEntry.deleteMany({
            where: {
                userId: userId,
                id: entryId
            }
        })

        if (result.count === 0) {
            return NextResponse.json(
                { message: 'Entry ID invalid' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { message: 'Entry deleted from collection', data: result },
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
