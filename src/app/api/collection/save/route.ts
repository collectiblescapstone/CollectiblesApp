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
        const {
            cardName,
            condition,
            variant,
            grade,
            gradeLevel,
            tags,
            cardId
        } = body

        if (!cardName && !cardId) {
            return NextResponse.json(
                { error: 'cardName or cardId is required' },
                { status: 400 }
            )
        }

        let result
        const existingEntry = await prisma.collectionEntry.findFirst({
            where: {
                userId: userId,
                cardId: cardId
            }
        })

        if (existingEntry) {
            result = await prisma.collectionEntry.update({
                where: { id: existingEntry.id },
                data: {
                    condition: condition ?? null,
                    variant: variant ?? null,
                    grade: grade ?? null,
                    gradeLevel: gradeLevel ?? null,
                    tags: tags ?? []
                }
            })
        } else {
            result = await prisma.collectionEntry.create({
                data: {
                    userId: userId,
                    cardId: cardId ?? null,
                    condition: condition ?? null,
                    variant: variant ?? null,
                    grade: grade ?? null,
                    gradeLevel: gradeLevel ?? null,
                    tags: tags ?? []
                }
            })
        }

        return NextResponse.json(
            { message: 'Saved to collection', data: result },
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
