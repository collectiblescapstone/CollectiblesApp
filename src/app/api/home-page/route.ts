import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const POST = async (request: Request) => {
    try {
        // Verify authentication
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - missing token' },
                { status: 401 }
            )
        }
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
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const [cardsInCollection, cardsForTrade, recentEntries] =
            await Promise.all([
                prisma.collectionEntry.count({
                    where: { userId: userID }
                }),
                prisma.collectionEntry.count({
                    where: { userId: userID, forTrade: true }
                }),
                prisma.collectionEntry.findMany({
                    where: { userId: userID },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                    select: {
                        card: {
                            select: {
                                name: true,
                                image_url: true
                            }
                        }
                    }
                })
            ])

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

        const cardCountById = await prisma.collectionEntry.groupBy({
            by: ['cardId'],
            _count: {
                cardId: true
            },
            where: {
                createdAt: {
                    gte: new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1
                    )
                }
            }
        })

        const cardIds = cardCountById.map((entry) => entry.cardId)

        const cards =
            cardIds.length > 0
                ? await prisma.card.findMany({
                      where: {
                          id: {
                              in: cardIds
                          }
                      },
                      select: {
                          id: true,
                          name: true,
                          image_url: true
                      }
                  })
                : []

        const countLookup = new Map(
            cardCountById.map((entry) => [entry.cardId, entry._count.cardId])
        )

        const allCards = cards.map((card) => ({
            name: card.name,
            imageUrl: card.image_url,
            count: countLookup.get(card.id) ?? 0
        }))

        const sortedCards = allCards.sort((a, b) => b.count - a.count)

        return NextResponse.json({
            ...user,
            cardsInCollection,
            cardsForTrade,
            cardsLoggedthisMonth,
            // Slice returns the top 3 popular cards, if there are less than 3 cards in the collection it will return all of them
            popularCards: sortedCards.slice(0, 3),
            recentCards: recentEntries.map((entry) => ({
                name: entry.card.name,
                imageUrl: entry.card.image_url
            }))
        })
    } catch (error) {
        console.error('Error in home-page route:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', message: error },
            { status: 500 }
        )
    }
}
