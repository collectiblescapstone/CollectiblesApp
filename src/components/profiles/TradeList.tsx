'use client'

import React from 'react'
import Divider from '@/components/profiles/Divider'
import { useRouter } from 'next/navigation'
import { Button, Flex, Image, Text, SimpleGrid } from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { PokemonCardImage } from '@/types/personal-profile'
import { useMobileView } from '@/utils/mobileViewFinder'

interface TradeListProps {
    type?: 'personal' | 'user'
    username: string
    tradelist: PokemonCardImage[]
}

const TradeList: React.FC<TradeListProps> = ({ type, username, tradelist }) => {
    const router = useRouter()

    const display = tradelist.slice(0, 3)
    const viewmore = tradelist.length > 3

    const isMobileView = useMobileView()

    const cardWidth = isMobileView ? '105px' : '140px'
    const gapSize = isMobileView ? 10 : 14
    const fontsize = isMobileView ? 'md' : 'lg'

    const press = () => {
        if (type === 'personal') {
            router.push('/personal-profile/trade')
            return
        }
        router.push(`/user-profile/trade?username=${username}`)
    }

    if (tradelist.length === 0) {
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
                        Trade List
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
                    Trade List
                </Text>
            </Flex>
            <SimpleGrid columns={{ base: 3 }} w="100%" gap={gapSize}>
                {display.map((item, index: number) => (
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
            {viewmore && (
                <Flex mt={5} justifyContent="center" w="100%">
                    <Button
                        variant="solid"
                        bg="brand.turtoise"
                        color="white"
                        size="sm"
                        onClick={press}
                    >
                        <FiPlus /> View more
                    </Button>
                </Flex>
            )}
        </Flex>
    )
}

export default TradeList
