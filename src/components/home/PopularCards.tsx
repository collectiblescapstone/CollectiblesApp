'use client'

import React from 'react'
import Divider from '@/components/profiles/Divider'
import { Flex, Image, Text, HStack } from '@chakra-ui/react'
import { PopCards } from '@/types/user-data'
import { LuFlame } from 'react-icons/lu'
import { useMobileView } from '@/utils/mobileViewFinder'

interface PopularCardsProps {
    cards?: PopCards[]
}

const PopularCards = ({ cards = [] }: PopularCardsProps) => {
    const isMobileView = useMobileView()

    const cardWidth = isMobileView ? '105px' : '140px'
    const gapSize = isMobileView ? 10 : 14
    const fontsize = isMobileView ? 'md' : 'lg'
    const iconsize = isMobileView ? 20 : 30

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
                    <LuFlame color="#d35400" size={iconsize} />
                    <Text
                        fontSize={fontsize}
                        color="gray.700"
                        fontWeight="semibold"
                        mb={0}
                    >
                        Popular This Month
                    </Text>
                </HStack>
            </Flex>
            {cards.length !== 0 ? (
                <Flex
                    flexDirection="row"
                    justifyContent="center"
                    alignItems="center"
                    wrap="wrap"
                    gap={gapSize}
                >
                    {cards.map((card: PopCards, index: number) => (
                        <Flex key={index}>
                            <Image
                                src={`${card.imageUrl}`}
                                alt={card.name}
                                w={cardWidth}
                                h="auto"
                                borderRadius="none"
                            />
                        </Flex>
                    ))}
                </Flex>
            ) : (
                <Flex
                    w="100%"
                    justifyContent="center"
                    alignItems="center"
                    py={3}
                >
                    <Text
                        fontSize={fontsize}
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
