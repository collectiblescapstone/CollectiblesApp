'use client'

import React, { useEffect, useState } from 'react'

import { Flex, Text, Box, Spinner, Button } from '@chakra-ui/react'
import Divider from '@/components/profiles/Divider'
import { useRandomCards } from '@/components/personal-profile/RandomCard' // for now, change later
import { PokemonCardImage } from '@/types/personal-profile'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { fetchTradeOptions } from '@/utils/getTradeOptions'
import { TradeCardProps, ViableOption } from '@/types/tradepost'
import { pfp_image_mapping } from '@/app/personal-profile/edit-profile/constants'
import TradePopup from '@/components/ui/PopupUI'
import TradeCardPopup from '@/components/trading/PopupTrade'
import ViableOptions from '@/components/trading/ViableOptions'

const TradeSuggestions: React.FC = () => {
    const { session } = useAuth()
    const router = useRouter()

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
        if (!userID) {
            setError('No user ID found')
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
                                pfp_image_mapping[viableUser.profile_pic],
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
    }, [userID])

    if (loading || !session) {
        return (
            <Box textAlign="center" mt={10}>
                Loading... <Spinner size="xl" />
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
    
    useEffect(() => {
            if (pathname !== '/trade') {
                closeTradePopup()
            }
        }, [pathname])

    return (
        <Flex
            flexDirection="column"
            gap={2}
            justifyContent="flex-start"
            alignItems="flex-start"
            w="100%"
            px={4}
        >
            <Divider />
            <Flex mt={1}>
                <Text
                    fontSize="md"
                    color="gray.700"
                    fontWeight="semibold"
                    mb={2}
                >
                    TradePost Suggestion
                </Text>
            </Flex>
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
                                user1Wishlist={
                                    u.user1Wishlist ?? []
                                }
                                user2Wishlist={
                                    u.user2Wishlist ?? []
                                }
                                onNavigateToProfile={
                                    closeTradePopup
                                }
                            />
                        ),
                        onClickClose: closeTradePopup
                    })
                }
            >
                <ViableOptions
                    key={u.username}
                    username={u.username}
                    avatarUrl={u.avatarUrl}
                    rating={u.rating}
                    user1Wishlist={u.user1Wishlist ?? []}
                    distance={u.distance}
                    ratingCount={u.ratingCount}
                />
            </Box>
            </Flex>
            {/* Button below navigates to /trade/page.tsx */}
            <Button
                size="xs"
                aria-label="See more trade suggestions"
                onClick={() => router.push('/trade')}
            >
                + Go to TradePost
            </Button>
        </Flex>
    )
}

export default TradeSuggestions
