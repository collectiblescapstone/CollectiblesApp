'use client'

import React from 'react'
import { Flex, Image } from '@chakra-ui/react'
import { PokemonCardImage } from '@/types/personal-profile'

interface TradingCardsProps {
    cards?: PokemonCardImage[]
}

const TradingCards = ({ cards = [] }: TradingCardsProps) => {
    const card_length = cards.length
    return (
        <Flex
            flexDirection="column"
            gap={2}
            justifyContent="flex-start"
            alignItems="center"
            w="100%"
        >
            <Flex
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                wrap="wrap"
                gap={4}
            >
                {cards.map((card: PokemonCardImage, index: number) => (
                    <Flex key={index}>
                        <Image
                            src={`${card.image}`}
                            alt={card.name}
                            h="auto"
                            w={
                                card_length <= 2
                                    ? '100px'
                                    : card_length <= 3
                                      ? '80px'
                                      : card_length <= 4
                                        ? '60px'
                                        : '40px'
                            }
                            borderRadius="none"
                        />
                    </Flex>
                ))}
            </Flex>
        </Flex>
    )
}

export default TradingCards
