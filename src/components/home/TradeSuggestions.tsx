'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import { Flex, Text, Box, Spinner, Button } from '@chakra-ui/react'
import Divider from '@/components/profiles/Divider'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { fetchTradeOptions } from '@/utils/getTradeOptions'
import { TradeCardProps, ViableOption } from '@/types/tradepost'
import { profilePictures } from '@/app/personal-profile/edit-profile/constants'
import TradePopup from '@/components/ui/PopupUI'
import TradeCardPopup from '@/components/trading/PopupTrade'
import ViableOptions from '@/components/trading/ViableOptions'

const TradeSuggestions: React.FC = () => {
    const { session, loading: authLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const userID = session?.user.id

    const [users, setUsers] = useState<TradeCardProps[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const closeTradePopup = () => {
        try {
            TradePopup.close('trade')
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('Overlay with id trade not found')
            ) {
                return
            }
            throw error
        }
    }

    useEffect(() => {
        if (!userID || !session?.access_token) {
            setLoading(false)
            return
        }
        const loadViableOptions = async () => {
            try {
                const data = await fetchTradeOptions(userID)

                const viableOptions =
                    (data?.viableOptions as ViableOption[] | undefined) ?? []

                const userMap = new Map<string, TradeCardProps>()

                for (const option of viableOptions) {
                    const viableUser = option.user
                    if (!userMap.has(viableUser.id)) {
                        userMap.set(viableUser.id, {
                            username: viableUser.username ?? 'Unknown User',
                            avatarUrl:
                                profilePictures[viableUser.profile_pic].path,
                            rating: 0,
                            ratingCount: 0,
                            distance: viableUser.distance,
                            user1Wishlist: option.cardsUser1WantsFromUser2.map(
                                (card) => ({
                                    name: card.name,
                                    image_url: card.image_url
                                })
                            ),
                            user2Wishlist: option.cardsUser2WantsFromUser1.map(
                                (card) => ({
                                    name: card.name,
                                    image_url: card.image_url
                                })
                            ),
                            contacts: [
                                'facebook',
                                'instagram',
                                'x',
                                'discord',
                                'whatsapp'
                            ]
                                .map((method) => {
                                    const value =
                                        viableUser[
                                            method as keyof typeof viableUser
                                        ]
                                    if (value) {
                                        return { method, value }
                                    }
                                    return null
                                })
                                .filter(
                                    (
                                        contact
                                    ): contact is {
                                        method: string
                                        value: string
                                    } => Boolean(contact)
                                )
                        })
                    }
                }
                setUsers(Array.from(userMap.values()))
                setError(null)
            } catch (error) {
                console.error(error)
                setError('Failed to fetch viable options')
            } finally {
                setLoading(false)
            }
        }

        loadViableOptions()
    }, [userID, session?.access_token])

    useEffect(() => {
        if (pathname !== '/trade' && pathname !== '/home') {
            closeTradePopup()
        }
    }, [pathname])

    if (authLoading || loading) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )
    }

    if (error) {
        return (
            <Flex justifyContent="center" alignItems="center" height="50vh">
                <Text>{error}</Text>
            </Flex>
        )
    }

    const closestUser = users.reduce<TradeCardProps | null>((closest, user) => {
        if (users.length === 0) {
            return null
        }
        const distance = user.distance
        if (distance == null) {
            return closest
        }

        if (closest?.distance == null || distance < closest.distance) {
            return user
        }

        return closest
    }, null)

    return (
        <Flex flexDirection="column" gap={3} w="100%" px={4}>
            <Divider />
            <Flex
                mt={1}
                justifyContent="flex-start"
                alignItems="flex-start"
                w="100%"
            >
                <Text
                    fontSize="md"
                    color="gray.700"
                    fontWeight="semibold"
                    mb={2}
                >
                    TradePost Suggestion
                </Text>
            </Flex>
            {closestUser ? (
                [closestUser].map((u) => (
                    <Box
                        key={u.username}
                        cursor="pointer"
                        alignItems="center"
                        onClick={() =>
                            TradePopup.open('trade', {
                                title: 'Trade with ' + u.username,
                                content: (
                                    <TradeCardPopup
                                        username={u.username}
                                        avatarUrl={u.avatarUrl}
                                        contacts={u.contacts}
                                        user1Wishlist={u.user1Wishlist ?? []}
                                        user2Wishlist={u.user2Wishlist ?? []}
                                        onNavigateToProfile={closeTradePopup}
                                    />
                                ),
                                onClickClose: closeTradePopup
                            })
                        }
                    >
                        <Flex justifyContent="center" alignItems="center">
                            <ViableOptions
                                username={u.username}
                                avatarUrl={u.avatarUrl}
                                rating={u.rating}
                                user1Wishlist={u.user1Wishlist ?? []}
                                distance={u.distance}
                                ratingCount={u.ratingCount}
                            />
                        </Flex>
                    </Box>
                ))
            ) : (
                <Flex
                    w="100%"
                    justifyContent="center"
                    alignItems="center"
                    py={3}
                >
                    <Text
                        fontSize="md"
                        color="gray.600"
                        fontWeight="semibold"
                        mb={2}
                        w="80%"
                        textAlign="center"
                    >
                        Let&apos;s add some more cards to that TradeList and
                        WishList, watcha say?
                    </Text>
                </Flex>
            )}
            {/* Button below navigates to /trade/page.tsx */}
            <Flex
                justifyContent="center"
                alignItems="center"
                w="100%"
                pt={{ base: 2, lg: 4 }}
                pb={5}
            >
                <Button
                    size={{ base: 'sm', lg: 'md' }}
                    aria-label="See more trade suggestions"
                    bg={'brand.turtoise'}
                    onClick={() => router.push('/trade')}
                >
                    Go to TradePost
                </Button>
            </Flex>
            <TradePopup.Viewport />
        </Flex>
    )
}

export default TradeSuggestions
