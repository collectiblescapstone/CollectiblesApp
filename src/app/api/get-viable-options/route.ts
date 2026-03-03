import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Calculate distance between two points using Haversine formula (in km)
const calculateHaversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371
    const phi_1 = (lat1 * Math.PI) / 180
    const phi_2 = (lat2 * Math.PI) / 180
    const delta_1 = ((lat2 - lat1) * Math.PI) / 180
    const delta_2 = ((lon2 - lon1) * Math.PI) / 180

    const a =
        Math.sin(delta_1 / 2) * Math.sin(delta_1 / 2) +
        Math.cos(phi_1) *
            Math.cos(phi_2) *
            Math.sin(delta_2 / 2) *
            Math.sin(delta_2 / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

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
            latitude: true,
            longitude: true,
            wishlist: {
                select: {
                    card: {
                        select: {
                            name: true,
                            id: true,
                            image_url: true
                        }
                    }
                }
            }
        }
    })

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tradeList = await prisma.collectionEntry.findMany({
        where: {
            userId: userID,
            forTrade: true
        },
        select: {
            card: {
                select: {
                    id: true,
                    name: true,
                    image_url: true
                }
            }
        }
    })

    const tradeListCardIds = new Set(tradeList.map((entry) => entry.card.id))

    const wishlistCardIds = user.wishlist.map((item) => item.card.id)

    // Find all collection entries that are up for trade and match any card in the user's wishlist
    const tradeMatches = wishlistCardIds.length
        ? await prisma.collectionEntry.findMany({
              where: {
                  forTrade: true,
                  cardId: { in: wishlistCardIds },
                  userId: { not: userID },
                  user: {
                      visibility: 'public'
                  }
              },
              select: {
                  card: {
                      select: {
                          id: true,
                          name: true,
                          image_url: true
                      }
                  },
                  user: {
                      select: {
                          id: true,
                          username: true,
                          profile_pic: true,
                          longitude: true,
                          latitude: true,
                          wishlist: {
                              select: {
                                  card: {
                                      select: {
                                          name: true,
                                          id: true,
                                          image_url: true
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          })
        : []

    // Organize the viable options by user, grouping matching trade cards from the original user's wishlist
    const viableOptionsMap = new Map<
        string,
        {
            user: {
                id: string
                username: string | null
                profile_pic: number
                distance: number | null
            }
            cards: { id: string; name: string; image_url: string }[]
        }
    >()

    // For each trade match, check if the user has any card in their wishlist that matches a card in the original user's trade list
    for (const match of tradeMatches) {
        const hasMutualTrade = match.user.wishlist.some((wishlistEntry) =>
            tradeListCardIds.has(wishlistEntry.card.id)
        )

        if (!hasMutualTrade) {
            continue
        }

        // If there's a mutual trade, add the matching card to that user's viable options
        const existing = viableOptionsMap.get(match.user.id)
        if (existing) {
            const cardAlreadyAdded = existing.cards.some(
                (card) => card.id === match.card.id
            )
            if (!cardAlreadyAdded) {
                existing.cards.push(match.card)
            }
        } else {
            viableOptionsMap.set(match.user.id, {
                user: {
                    id: match.user.id,
                    username: match.user.username,
                    profile_pic: match.user.profile_pic,
                    distance: calculateHaversineDistance(
                        user.latitude ?? 0,
                        user.longitude ?? 0,
                        match.user.latitude ?? 0,
                        match.user.longitude ?? 0
                    )
                },
                cards: [match.card]
            })
        }
    }

    return NextResponse.json({
        ...user,
        tradeList,
        viableOptions: Array.from(viableOptionsMap.values())
    })
}
