'use client'

import React, { useEffect, useState } from 'react'

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
import { pfp_image_mapping } from '../personal-profile/edit-profile/constants'
import { IoIosInformationCircleOutline } from 'react-icons/io'
import UserSearch from '@/components/trading/UserSearch'
import TradePopup from '@/components/ui/PopupUI'
import TradeCardPopup from '@/components/trading/PopupTrade'

const TradePage = () => {
    const { session } = useAuth()
    const userID = session?.user.id

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
                                pfp_image_mapping[viableUser.profile_pic],
                            rating: 0,
                            distance: viableUser.distance,
                            cards: option.cards
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
        <Box>
            <Flex alignItems="center" flexDirection="column" mt={3}>
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
                            moment. Try editing your collection or wishlist to
                            find some matches!
                        </Text>
                    </Flex>
                </Box>
            ) : (
                <Flex flexDirection="column" gap={6} mt={1}>
                    <Flex
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                        w="100%"
                        gap={0}
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
                            >
                                <HStack justifyContent="space-between" w="100%">
                                    <Slider.Label w="50%">
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
                    <Flex flexDirection="column" gap={6} alignItems="center">
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
                                                    contacts={u.contacts}
                                                />
                                            ),
                                            onClickClose: () =>
                                                TradePopup.close('trade')
                                        })
                                    }
                                >
                                    <ViableOptions
                                        key={u.username}
                                        username={u.username}
                                        avatarUrl={u.avatarUrl}
                                        rating={u.rating}
                                        cards={u.cards}
                                        distance={u.distance}
                                    />
                                </Box>
                            ))
                        })()}
                        <TradePopup.Viewport />
                    </Flex>
                </Flex>
            )}
        </Box>
    )
}

export default TradePage
