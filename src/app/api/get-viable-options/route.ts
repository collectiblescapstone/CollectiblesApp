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

type CardSummary = {
    id: string
    name: string
    image_url: string
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

    const tradeListCardsById = new Map<string, CardSummary>(
        tradeList.map((entry) => [entry.card.id, entry.card])
    )

    const wishlistCardIds = user.wishlist.map((item) => item.card.id)

    // Find all collection entries that are up for trade and match any card in the user's wishlist.
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
                          facebook: true,
                          instagram: true,
                          x: true,
                          discord: true,
                          whatsapp: true,
                          rating: true,
                          rating_count: true,
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

    // Group viable options by User 2 with cards each side wants.
    const viableOptionsMap = new Map<
        string,
        {
            user: {
                id: string
                username: string | null
                profile_pic: number | null
                distance: number | null
                facebook: string | null
                instagram: string | null
                x: string | null
                discord: string | null
                whatsapp: string | null
                rating: number
                rating_count: number
            }
            // User 1 is logged in user, User 2 is the potential match - these names are from the perspective of the algorithm, not the frontend display
            cardsUser1WantsFromUser2: CardSummary[]
            cardsUser2WantsFromUser1: CardSummary[]
        }
    >()

    for (const match of tradeMatches) {
        const cardsUser2WantsFromUser1 = match.user.wishlist
            .map((wishlistEntry) =>
                tradeListCardsById.get(wishlistEntry.card.id)
            )
            .filter((card): card is CardSummary => Boolean(card))

        if (!cardsUser2WantsFromUser1.length) {
            continue
        }

        const existing = viableOptionsMap.get(match.user.id)

        if (existing) {
            const hasCardUser1Wants = existing.cardsUser1WantsFromUser2.some(
                (card) => card.id === match.card.id
            )
            if (!hasCardUser1Wants) {
                existing.cardsUser1WantsFromUser2.push(match.card)
            }

            for (const mutualCard of cardsUser2WantsFromUser1) {
                const hasMutualCard = existing.cardsUser2WantsFromUser1.some(
                    (card) => card.id === mutualCard.id
                )
                if (!hasMutualCard) {
                    existing.cardsUser2WantsFromUser1.push(mutualCard)
                }
            }

            continue
        }

        const hasValidCoords =
            user.latitude !== null &&
            user.longitude !== null &&
            match.user.latitude !== null &&
            match.user.longitude !== null

        viableOptionsMap.set(match.user.id, {
            user: {
                id: match.user.id,
                username: match.user.username,
                profile_pic: match.user.profile_pic,
                facebook: match.user.facebook,
                instagram: match.user.instagram,
                x: match.user.x,
                discord: match.user.discord,
                whatsapp: match.user.whatsapp,
                rating: match.user.rating,
                rating_count: match.user.rating_count,
                distance: hasValidCoords
                    ? calculateHaversineDistance(
                          user.latitude!,
                          user.longitude!,
                          match.user.latitude!,
                          match.user.longitude!
                      )
                    : null
            },
            cardsUser1WantsFromUser2: [match.card],
            cardsUser2WantsFromUser1
        })
    }

    return NextResponse.json({
        viableOptions: Array.from(viableOptionsMap.values()).filter(
            (option) =>
                option.user.distance !== null && option.user.distance < 500
        )
    })
}
