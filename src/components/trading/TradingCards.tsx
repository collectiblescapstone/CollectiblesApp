'use client'

import React from 'react'
import { Flex, Image } from '@chakra-ui/react'
import { PokemonCardImage } from '@/types/personal-profile'

const TradingCards: React.FC<{ cards?: PokemonCardImage[] }> = ({
    cards = []
}) => {
    const card_length = cards.length
    return (
        <Flex
            flexDirection="column"
            gap={2}
            justifyContent="flex-start"
            alignItems="center"
            w="100%"
            px={4}
        >
            <Flex
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                wrap="wrap"
                gap={5}
            >
                {cards.map((card: PokemonCardImage, index: number) => (
                    <Flex key={index}>
                        <Image
                            src={`${card.image}`}
                            alt={card.name}
                            w="105px"
                            h="auto"
                            scale={
                                card_length <= 2
                                    ? '100%'
                                    : card_length <= 4
                                      ? '60%'
                                      : '10%'
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
