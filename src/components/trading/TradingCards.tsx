'use client'

import React from 'react'
import { Flex, Image, SimpleGrid } from '@chakra-ui/react'
import { PokemonCardImage } from '@/types/personal-profile'

interface TradingCardsProps {
    cards?: PokemonCardImage[]
}

const TradingCards = ({ cards = [] }: TradingCardsProps) => {
    return (
        <SimpleGrid columns={{ base: 4 }} w="100%" gap={2} maxW="100%">
            {cards.map((card: PokemonCardImage, index: number) => (
                <Flex key={index} maxW="100%">
                    <Image
                        src={`${card.image}`}
                        alt={card.name}
                        h="auto"
                        w="100%"
                        maxW="100%"
                        borderRadius="none"
                    />
                </Flex>
            ))}
        </SimpleGrid>
    )
}

export default TradingCards
