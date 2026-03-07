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
        const { entryId } = body

        if (!entryId) {
            return NextResponse.json(
                { error: 'entryId is required' },
                { status: 400 }
            )
        }

        let result
        const existingEntry = await prisma.collectionEntry.findFirst({
            where: {
                userId: userId,
                id: entryId
            }
        })

        if (existingEntry) {
            result = await prisma.collectionEntry.delete({
                where: { id: entryId, userId: userId }
            })
            return NextResponse.json(
                { message: 'Entry deleted from collection', data: result },
                { status: 200 }
            )
        }
        return NextResponse.json(
            { message: 'Entry ID invalid' },
            { status: 404 }
        )
    } catch (err) {
        console.error('collection/save error', err)
        return NextResponse.json(
            { error: 'Internal Server Error', message: String(err) },
            { status: 500 }
        )
    }
}
