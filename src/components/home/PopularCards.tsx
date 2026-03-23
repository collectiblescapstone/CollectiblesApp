'use client'

import React from 'react'
import Divider from '@/components/profiles/Divider'
import { Flex, Image, Text, HStack, SimpleGrid } from '@chakra-ui/react'
import { PopCards } from '@/types/user-data'
import { LuFlame } from 'react-icons/lu'

interface PopularCardsProps {
    cards?: PopCards[]
}

const PopularCards = ({ cards = [] }: PopularCardsProps) => {
    return (
        <Flex
            flexDirection="column"
            gap={3}
            justifyContent="flex-start"
            alignItems="flex-start"
            w="100%"
            px={4}
        >
            <Divider />
            <Flex mt={1}>
                <HStack gap={1} alignItems="center">
                    <LuFlame color="#d35400" size={20} />
                    <Text
                        fontSize={{ base: 'md', lg: 'lg' }}
                        color="gray.700"
                        fontWeight="semibold"
                        mb={0}
                    >
                        Popular This Month
                    </Text>
                </HStack>
            </Flex>
            {cards.length !== 0 ? (
                <SimpleGrid
                    columns={{ base: 3 }}
                    w="100%"
                    gap={{ base: 10, lg: 12 }}
                >
                    {cards.map((card: PopCards, index: number) => (
                        <Flex key={index}>
                            <Image
                                src={`${card.imageUrl}`}
                                alt={card.name}
                                w="95%"
                                h="auto"
                                borderRadius="none"
                            />
                        </Flex>
                    ))}
                </SimpleGrid>
            ) : (
                <Flex
                    w="100%"
                    justifyContent="center"
                    alignItems="center"
                    py={3}
                >
                    <Text
                        fontSize={{ base: 'md', lg: 'lg' }}
                        color="gray.600"
                        fontWeight="semibold"
                        mb={2}
                    >
                        Be the first to get a trend going!
                    </Text>
                </Flex>
            )}
        </Flex>
    )
}

export default PopularCards
