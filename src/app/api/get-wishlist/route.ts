import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export const POST = async (request: NextRequest) => {
    try {
        const payload: {
            userId: string
        } = await request.json()

        const wishlist = await prisma.wishlistEntry.findMany({
            where: {
                userId: payload.userId
            }
        })

        return NextResponse.json(wishlist)
    } catch (error) {
        console.error('Error in get wishlist API:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
