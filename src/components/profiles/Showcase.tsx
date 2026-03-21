'use client'

import React from 'react'
import Divider from '@/components/profiles/Divider'
import { Flex, Image, Text, SimpleGrid } from '@chakra-ui/react'
import { PokemonCardImage } from '@/types/personal-profile'
import { useMobileView } from '@/utils/mobileViewFinder'

interface ShowcaseProps {
    showcaseList: PokemonCardImage[]
}

const Showcase: React.FC<ShowcaseProps> = ({ showcaseList }) => {
    const display = showcaseList.slice(0, 3)

    const isMobileView = useMobileView()

    const cardWidth = isMobileView ? '105px' : '140px'
    const gapSize = isMobileView ? 10 : 14
    const fontsize = isMobileView ? 'md' : 'lg'

    if (showcaseList.length === 0) {
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
                        fontSize={fontsize}
                        color="gray.900"
                        fontWeight="semibold"
                        mb={2}
                    >
                        Showcase
                    </Text>
                </Flex>
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
                        User has not added any cards...yet
                    </Text>
                </Flex>
            </Flex>
        )
    }

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
                    fontSize={fontsize}
                    color="gray.900"
                    fontWeight="semibold"
                    mb={2}
                >
                    Showcase
                </Text>
            </Flex>
            <SimpleGrid columns={{ base: 3 }} w="100%" gap={gapSize}>
                {display.map((item: PokemonCardImage, index: number) => (
                    <Flex key={index}>
                        <Image
                            src={`${item.image}`}
                            alt={item.name}
                            w={cardWidth}
                            h="auto"
                            borderRadius="none"
                        />
                    </Flex>
                ))}
            </SimpleGrid>
        </Flex>
    )
}

export default Showcase
