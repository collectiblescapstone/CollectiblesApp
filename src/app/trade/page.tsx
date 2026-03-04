'use client'

import React, { useEffect, useState } from 'react'

import { Flex, HStack, Text, Box, Slider, Spinner } from '@chakra-ui/react'
import ViableOptions from '@/components/trading/ViableOptions'
import { TradeCardProps, ViableOption } from '@/types/tradepost'
import { useAuth } from '@/context/AuthProvider'
import { fetchTradeOptions } from '@/utils/getTradeOptions'
import { pfp_image_mapping } from '../personal-profile/edit-profile/constants'

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

    if (users.length === 0) {
        return (
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
                        Thats a special hand you have there!
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        We could not find any viable trades for you at the
                        moment. Try editing your collection or wishlist to find
                        some matches!
                    </Text>
                </Flex>
            </Box>
        )
    }

    return (
        <Flex flexDirection="column" gap={6} mt={3}>
            <Flex gap={2} justifyContent="right">
                <Box position="relative" px={9}>
                    <Box>
                        <Slider.Root
                            maxW="sm"
                            size="sm"
                            min={20}
                            max={500}
                            step={10}
                            value={[sliderValue]}
                            onValueChange={slideFn}
                            width={150}
                        >
                            <HStack
                                justify="space-between"
                                justifyContent="left"
                            >
                                <Slider.Label>
                                    Range: {sliderValue} km
                                </Slider.Label>
                            </HStack>
                            <Slider.Control>
                                <Slider.Track>
                                    <Slider.Range />
                                </Slider.Track>
                                <Slider.Thumbs />
                            </Slider.Control>
                        </Slider.Root>
                    </Box>
                </Box>
            </Flex>
            <Flex flexDirection="column" gap={6} alignItems="center">
                {(() => {
                    const filteredUsers = users.filter(
                        (u) => !u.distance || u.distance <= sliderValue
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
                                        Everyone is in a galaxy far, far away!
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        No viable trades within this distance.
                                        Try widening the distance filter to find
                                        more matches!
                                    </Text>
                                </Flex>
                            </Box>
                        )
                    }
                    return filteredUsers.map((u) => (
                        <ViableOptions
                            key={u.username}
                            username={u.username}
                            avatarUrl={u.avatarUrl}
                            rating={u.rating}
                            cards={u.cards}
                            distance={u.distance}
                        />
                    ))
                })()}
            </Flex>
        </Flex>
    )
}

export default TradePage
