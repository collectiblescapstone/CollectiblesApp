import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import prisma from '@/lib/prisma'

export const POST = async (request: NextRequest) => {
    try {
        const { userId: reqUserId, blockedUserId } = await request.json()
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

        if (reqUserId !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized - user ID mismatch' },
                { status: 401 }
            )
        }
        if (userId === blockedUserId) {
            return NextResponse.json(
                { error: 'Users cannot block themselves' },
                { status: 400 }
            )
        }

        // Check if the block already exists
        const existingBlock = await prisma.blockList.findUnique({
            where: {
                userId_blockedUserId: {
                    userId: userId,
                    blockedUserId: blockedUserId
                }
            }
        })

        if (existingBlock) {
            return NextResponse.json(
                { error: 'User is already blocked' },
                { status: 400 }
            )
        }

        await prisma.blockList.create({
            data: {
                userId: userId,
                blockedUserId: blockedUserId
            }
        })

        return NextResponse.json({ message: 'User blocked successfully' })
    } catch (error) {
        console.error('Error in block-user API:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
