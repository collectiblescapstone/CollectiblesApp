import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export const POST = async (request: NextRequest) => {
    try {
        const payload: {
            userId: string
            cardId: string
            remove?: boolean
        } = await request.json()

        // Check if card exists
        const cardExists = await prisma.card.findFirst({
            where: {
                id: payload.cardId
            }
        })
        if (!cardExists) {
            return NextResponse.json(
                {
                    error: 'Requested card ID does not exist'
                },
                { status: 400 }
            )
        }

        // Check if it's already been added
        const existingEntry = await prisma.wishlistEntry.findFirst({
            where: {
                userId: payload.userId,
                cardId: payload.cardId
            }
        })

        // Remove if requested and card exists
        if (payload.remove && existingEntry) {
            await prisma.wishlistEntry.deleteMany({
                where: {
                    userId: payload.userId,
                    cardId: payload.cardId
                }
            })

            return NextResponse.json({
                message: 'Wishlist entry removed successfully'
            })
        }

        // Add requested if doesn't already exist
        if (!existingEntry) {
            await prisma.wishlistEntry.create({
                data: {
                    userId: payload.userId,
                    cardId: payload.cardId
                }
            })
        }

        return NextResponse.json({
            message: 'Wishlist entry created successfully'
        })
    } catch (error) {
        console.error('Error in update wishlist API:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
