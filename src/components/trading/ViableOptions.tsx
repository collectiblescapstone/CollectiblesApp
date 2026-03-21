'use client'

import React from 'react'
import { Avatar, Card, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import TradingCards from '@/components/trading/TradingCards'
import { TradeCardProps } from '@/types/tradepost'
import StarRating from '@/components/profiles/StarRating'

const ViableOptions: React.FC<TradeCardProps> = ({
    username,
    avatarUrl,
    rating,
    user1Wishlist,
    distance,
    ratingCount
}) => {
    const cardsToDisplay = user1Wishlist ?? []
    const cardlength = cardsToDisplay.length
    return (
        <Card.Root
            w="100%"
            minW="350px"
            maxW="350px"
            borderRadius="md"
            shadow="md"
        >
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
                        cards={cardsToDisplay.map((card) => ({
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
                            <Avatar.Root
                                boxSize="65px"
                                p={2}
                                background="white"
                            >
                                <Avatar.Image
                                    objectFit="contain"
                                    src={avatarUrl}
                                />
                            </Avatar.Root>
                            <Stack gap="0">
                                <Text fontWeight="semibold" textStyle="sm">
                                    {username}
                                </Text>
                            </Stack>
                        </Flex>
                        <HStack gap="1" align="center">
                            <StarRating
                                rating={Number.isFinite(rating) ? rating : 0}
                                ratingCount={
                                    Number.isFinite(ratingCount)
                                        ? ratingCount
                                        : 0
                                }
                            />
                        </HStack>
                    </Flex>
                </Card.Footer>
            </Flex>
        </Card.Root>
    )
}

export default ViableOptions
