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
    cards,
    distance
}) => {
    const cardlength = cards?.length ?? 0
    return (
        <Card.Root width="85%">
            <Flex flexDirection="column">
                <Flex
                    flexDirection="row"
                    justifyContent="space-between"
                    w="100%"
                >
                    <Text
                        fontSize="sm"
                        color="brand.turtoise"
                        px={4}
                        pt={4}
                        textAlign="left"
                        fontWeight="semibold"
                    >
                        {cardlength} {cardlength === 1 ? 'card' : 'cards'}
                    </Text>
                    <Text
                        fontSize="sm"
                        color="gray.500"
                        px={4}
                        pt={4}
                        textAlign="right"
                    >
                        {distance !== null && distance !== undefined
                            ? `${distance.toFixed(1)} km away`
                            : 'Distance unknown'}
                    </Text>
                </Flex>
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
                    <Flex
                        flexDirection="row"
                        justifyContent="space-between"
                        w="100%"
                    >
                        <Flex align="center" gap={3}>
                            <Avatar.Root boxSize="45px" shape="rounded">
                                <Avatar.Image src={avatarUrl} />
                            </Avatar.Root>
                            <Stack gap="0">
                                <Text fontWeight="semibold" textStyle="sm">
                                    {username}
                                </Text>
                            </Stack>
                        </Flex>
                        <Flex align="center" gap={1}>
                            <Stack gap="0">
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
                                            return (
                                                <LuStar
                                                    color={color}
                                                    size={20}
                                                />
                                            )
                                        })()}
                                    </Box>
                                    <Text fontSize="sm" fontWeight="semibold">
                                        {Number.isFinite(rating)
                                            ? rating.toFixed(1)
                                            : '-'}
                                    </Text>
                                </HStack>
                            </Stack>
                        </Flex>
                    </Flex>
                </Card.Footer>
            </Flex>
        </Card.Root>
    )
}

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
                    gap={3}
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
                            min={10}
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
                                    gap={3}
                                    pb={16}
                                >
                                    <Text
                                        fontSize="lg"
                                        fontWeight="semibold"
                                        color="brand.turtoise"
                                    >
                                        ...Hello?
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
                        <TradeCard
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
