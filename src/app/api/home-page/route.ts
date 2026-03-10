import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const POST = async (request: Request) => {
    const { userID } = await request.json()

    if (!userID) {
        return NextResponse.json(
            { error: 'No userID given, fetch terminated' },
            { status: 400 }
        )
    }

    const user = await prisma.user.findUnique({
        where: { id: userID },
        select: {
            username: true,
            firstName: true
        }
    })

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalcollection = await prisma.collectionEntry.findMany({
        where: {
            userId: userID
        },
        select: {
            card: {}
        }
    })

    const tradeList = await prisma.collectionEntry.findMany({
        where: {
            userId: userID,
            forTrade: true
        },
        select: {
            card: {}
        }
    })

    const cardsInCollection = totalcollection.length
    const cardsForTrade = tradeList.length
    const cardsLoggedthisMonth = await prisma.collectionEntry.count({
        where: {
            userId: userID,
            createdAt: {
                gte: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1
                )
            }
        }
    })

    return NextResponse.json({
        ...user,
        cardsInCollection,
        cardsForTrade,
        cardsLoggedthisMonth
    })
}
