'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import {
    Flex,
    HStack,
    Text,
    Box,
    Slider,
    Spinner,
    Button,
    Popover,
    Portal
} from '@chakra-ui/react'
import ViableOptions from '@/components/trading/ViableOptions'
import { TradeCardProps, ViableOption } from '@/types/tradepost'
import { useAuth } from '@/context/AuthProvider'
import { fetchTradeOptions } from '@/utils/getTradeOptions'
import { profilePictures } from '../personal-profile/edit-profile/constants'
import { IoIosInformationCircleOutline } from 'react-icons/io'
import UserSearch from '@/components/trading/UserSearch'
import TradePopup from '@/components/ui/PopupUI'
import TradeCardPopup from '@/components/trading/PopupTrade'

const TradePage = () => {
    const pathname = usePathname()
    const { session } = useAuth()
    const userID = session?.user.id

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

    const [users, setUsers] = useState<TradeCardProps[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const [sliderValue, setSliderValue] = useState<number>(100)
    const slideFn = (details: { value: number[] }) => {
        setSliderValue(details.value[0])
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
                                profilePictures[viableUser.profile_pic].path,
                            rating: viableUser.rating ?? 0,
                            ratingCount: viableUser.rating_count ?? 0,
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

    useEffect(() => {
        if (pathname !== '/trade') {
            closeTradePopup()
        }
    }, [pathname])

    if (loading || !session) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )
    }

    if (error) {
        return (
            <Flex
                textAlign="center"
                justifyContent="center"
                alignItems="center"
                height="50vh"
                px={10}
            >
                <Text>{error}</Text>
            </Flex>
        )
    }

    return (
        <Flex flexDirection="column" gap={3} w="100%">
            <Flex alignItems="center" flexDirection="column" mt={6}>
                <UserSearch />
            </Flex>

            {users.length === 0 ? (
                <Box bg="white" minH="100vh" color="black" mb={3}>
                    <Flex
                        textAlign="center"
                        justifyContent="center"
                        alignItems="center"
                        height="50vh"
                        px={10}
                        gap={4}
                        flexDirection="column"
                    >
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            color="brand.turtoise"
                        >
                            That&apos;s a special hand you have there!
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            We could not find any viable trades for you at the
                            moment. Try editing your collection, wishlist, or
                            location info to find some matches!
                        </Text>
                    </Flex>
                </Box>
            ) : (
                <Flex flexDirection="column" gap={6} mt={1} w="100%">
                    <Flex
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                        pr={9}
                        pl={3}
                    >
                        <Popover.Root>
                            <Popover.Trigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Info"
                                >
                                    <IoIosInformationCircleOutline />
                                </Button>
                            </Popover.Trigger>
                            <Portal>
                                <Popover.Positioner>
                                    <Popover.Content>
                                        <Popover.Arrow />
                                        <Popover.Body>
                                            <Text
                                                fontSize="xs"
                                                color="gray.600"
                                                textAlign="center"
                                            >
                                                Distance is calculated based on
                                                the location information
                                                provided by users.
                                            </Text>
                                        </Popover.Body>
                                    </Popover.Content>
                                </Popover.Positioner>
                            </Portal>
                        </Popover.Root>
                        <Box position="relative" w="100%">
                            <Slider.Root
                                size="sm"
                                min={20}
                                max={500}
                                step={10}
                                value={[sliderValue]}
                                onValueChange={slideFn}
                                width="100%"
                                cursor="pointer"
                            >
                                <HStack justifyContent="space-between">
                                    <Slider.Label w="40%" textAlign="left">
                                        Range: {sliderValue} km
                                    </Slider.Label>

                                    <Slider.Control>
                                        <Slider.Track>
                                            <Slider.Range />
                                        </Slider.Track>
                                        <Slider.Thumbs />
                                    </Slider.Control>
                                </HStack>
                            </Slider.Root>
                        </Box>
                    </Flex>
                    <Flex flexDirection="column" w="100%" gap={2}>
                        {(() => {
                            const filteredUsers = users.filter(
                                (u) =>
                                    u.distance !== null &&
                                    u.distance !== undefined &&
                                    u.distance <= sliderValue
                            )
                            if (filteredUsers.length === 0) {
                                return (
                                    <Box textAlign="center" mt={10}>
                                        <Flex
                                            textAlign="center"
                                            justifyContent="center"
                                            alignItems="center"
                                            height="50vh"
                                            px={10}
                                            flexDirection="column"
                                            gap={4}
                                            pb={16}
                                        >
                                            <Text
                                                fontSize="lg"
                                                fontWeight="semibold"
                                                color="brand.turtoise"
                                            >
                                                Everyone is in a galaxy far, far
                                                away!
                                            </Text>
                                            <Text
                                                fontSize="sm"
                                                color="gray.600"
                                            >
                                                No viable trades within this
                                                distance. Try widening the
                                                distance filter to find more
                                                matches!
                                            </Text>
                                        </Flex>
                                    </Box>
                                )
                            }
                            return filteredUsers.map((u) => (
                                <Flex
                                    key={u.username}
                                    w="100%"
                                    justifyContent="center"
                                >
                                    <Box
                                        cursor="pointer"
                                        onClick={() =>
                                            TradePopup.open('trade', {
                                                title:
                                                    'Trade with ' + u.username,
                                                content: (
                                                    <TradeCardPopup
                                                        username={u.username}
                                                        avatarUrl={u.avatarUrl}
                                                        contacts={u.contacts}
                                                        user1Wishlist={
                                                            u.user1Wishlist ??
                                                            []
                                                        }
                                                        user2Wishlist={
                                                            u.user2Wishlist ??
                                                            []
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
                                        <Flex
                                            minW="40dvw"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <ViableOptions
                                                key={u.username}
                                                username={u.username}
                                                avatarUrl={u.avatarUrl}
                                                rating={u.rating}
                                                user1Wishlist={
                                                    u.user1Wishlist ?? []
                                                }
                                                distance={u.distance}
                                                ratingCount={u.ratingCount}
                                            />
                                        </Flex>
                                    </Box>
                                </Flex>
                            ))
                        })()}
                        <TradePopup.Viewport />
                    </Flex>
                </Flex>
            )}
        </Flex>
    )
}

export default TradePage
