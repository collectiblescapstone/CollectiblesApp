'use client'

import React from 'react'
import Divider from '@/components/profiles/Divider'
import { Flex, Image, Text } from '@chakra-ui/react'
import { PokemonCardImage } from '@/types/personal-profile'

interface RecentCardsProps {
    cards?: PokemonCardImage[]
}

const Collection = ({ cards = [] }: RecentCardsProps) => {
    return (
        <Flex
            flexDirection="column"
            gap={2}
            justifyContent="flex-start"
            alignItems="flex-start"
            w="100%"
            px={4}
        >
            <Divider />
            <Flex mt={1}>
                <Text
                    fontSize="md"
                    color="gray.700"
                    fontWeight="semibold"
                    mb={2}
                >
                    Recently Logged Cards
                </Text>
            </Flex>
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
                            src={card.image}
                            alt={card.name}
                            w="105px"
                            h="auto"
                            borderRadius="none"
                        />
                    </Flex>
                ))}
            </Flex>
        </Flex>
    )
}

export default Collection
