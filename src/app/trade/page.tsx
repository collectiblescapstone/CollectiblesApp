'use client'

import React, { useEffect, useState } from 'react'

import {
    Avatar,
    Card,
    Flex,
    HStack,
    Stack,
    Text,
    Box,
    Slider,
    Spinner
} from '@chakra-ui/react'
import TradingCards from '@/components/trading/TradingCards'
import { useAuth } from '@/context/AuthProvider'
import { LuStar } from 'react-icons/lu'
import { CapacitorHttp } from '@capacitor/core'
import { baseUrl } from '@/utils/constants'
import { pfp_image_mapping } from '../personal-profile/edit-profile/constants'

type TradeCardProps = {
    username: string
    avatarUrl?: string
    rating: number
    cards?: { id: string; name: string; image_url: string }[]
    distance?: number | null
}

type ViableOption = {
    user: {
        id: string
        username: string | null
        profile_pic: number
        distance: number | null
    }
    cards: { id: string; name: string; image_url: string }[]
}

const TradeCard: React.FC<TradeCardProps> = ({
    username,
    avatarUrl,
    rating,
    cards
}) => {
    return (
        <Card.Root width="80%">
            <Card.Body>
                <TradingCards
                    cards={cards?.map((card) => ({
                        id: card.id,
                        name: card.name,
                        image: card.image_url
                    }))}
                />
            </Card.Body>
            <Card.Footer>
                <HStack mb="0" gap="3">
                    <Avatar.Root>
                        <Avatar.Image src={avatarUrl} />
                    </Avatar.Root>
                    <Stack gap="0">
                        <Text fontWeight="semibold" textStyle="sm">
                            {username}
                        </Text>
                    </Stack>
                    <Stack gap="0">
                        {/* show star and numeric rating side-by-side */}
                        <HStack gap="1" align="center">
                            <Box>
                                {(() => {
                                    const color =
                                        rating <= 2.5
                                            ? '#ff3b30'
                                            : rating < 4.0
                                              ? '#ffd60a'
                                              : rating < 5
                                                ? '#32d74b'
                                                : '#08a9c6'
                                    return <LuStar color={color} size={20} />
                                })()}
                            </Box>
                            <Text fontSize="sm" fontWeight="semibold">
                                {Number.isFinite(rating)
                                    ? rating.toFixed(1)
                                    : '-'}
                            </Text>
                        </HStack>
                    </Stack>
                </HStack>
            </Card.Footer>
        </Card.Root>
    )
}

const TradePage = () => {
    const { session } = useAuth()
    const userID = session?.user.id

    const [users, setUsers] = useState<TradeCardProps[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const [sliderValue, setSliderValue] = useState<number>(40)
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
                const response = await CapacitorHttp.post({
                    url: `${baseUrl}/api/get-viable-options`,
                    data: { userID },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const viableOptions =
                    (response.data?.viableOptions as
                        | ViableOption[]
                        | undefined) ?? []

                const userMap = new Map<string, TradeCardProps>()

                for (const option of viableOptions) {
                    const viableUser = option.user
                    if (!userMap.has(viableUser.id)) {
                        userMap.set(viableUser.id, {
                            username: viableUser.username ?? 'Unknown User',
                            avatarUrl:
                                pfp_image_mapping[viableUser.profile_pic],
                            rating: 0,
                            distance: viableUser.distance
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
        <Box bg="white" minH="100vh" color="black" mb={4}>
            <Flex flexDirection="column" alignItems="center" gap={2}>
                <Flex
                    flexDirection="row"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                ></Flex>
                <Box w="100%" position="relative" px={4}>
                    <Box position="absolute" right={4} top="50%">
                        <Slider.Root
                            maxW="sm"
                            size="sm"
                            defaultValue={[40]}
                            value={[sliderValue]}
                            onValueChange={slideFn}
                        >
                            <HStack justify="space-between">
                                <Slider.Label>
                                    Distance: {sliderValue}
                                </Slider.Label>
                                <Slider.ValueText />
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
                                >
                                    <Text>
                                        ....Looks like there are no viable
                                        trades within this distance. Try
                                        widening the distance filter to find
                                        more matches!
                                    </Text>
                                </Flex>
                            </Box>
                        )
                    }
                    return filteredUsers.map((u) => (
                        <TradeCard
                            key={u.username}
                            username={u.username}
                            avatarUrl={u.avatarUrl}
                            rating={u.rating}
                            cards={u.cards}
                        />
                    ))
                })()}
            </Flex>
        </Box>
    )
}

export default TradePage
