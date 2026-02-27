'use client'

import React from 'react'

import { Box, Flex, Image, Button, Text, Spinner } from '@chakra-ui/react'
import { FiPlusCircle, FiXCircle } from 'react-icons/fi'
import { useRandomCards } from '@/components/personal-profile/RandomCard'
import { PokemonCardImage } from '@/types/personal-profile'
import { useAuth } from '@/context/AuthProvider'

const WishScreen: React.FC = () => {
    const { session, loading } = useAuth()

    const removecard = () => {
        // Edit remove card item logic here
    }

    const addcard = () => {
        // Edit add card item logic here
    }

    const { cards, loading: cardsLoading } = useRandomCards('pop1', 7)
    if (cardsLoading) return <Text>Loading cards...</Text>

    if (loading || !session) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )
    }

    return (
        <Box bg="white" minH="100vh" color="black">
            <Flex flexDirection="column" gap={6} mt={6}>
                <Flex
                    flexDirection="row"
                    justifyContent="center"
                    alignItems="center"
                    wrap="wrap"
                    gap={5}
                >
                    <Box
                        position="relative"
                        w="105px"
                        h="140px"
                        overflow="hidden"
                        rounded="md"
                    >
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            w="100%"
                            h="100%"
                            bg="black"
                            opacity={0.5}
                        />
                        <Flex
                            position="absolute"
                            justifyContent="center"
                            alignItems="center"
                            top={0}
                            left={0}
                            w="100%"
                            h="100%"
                        >
                            <Button
                                onClick={addcard}
                                position="absolute"
                                size="2xl"
                                rounded="sm"
                                variant="ghost"
                            >
                                <FiPlusCircle color="white" />
                            </Button>
                        </Flex>
                    </Box>
                    {cards.map((card: PokemonCardImage, index: number) => (
                        <Flex key={index}>
                            <Box
                                position="relative"
                                w="105px"
                                h="auto"
                                overflow="hidden"
                            >
                                <Image
                                    src={`${card.image}/high.png`}
                                    alt={card.name}
                                    w="105px"
                                    h="auto"
                                    borderRadius="none"
                                />
                                <Box
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    w="100%"
                                    h="100%"
                                    bg="black"
                                    opacity={0.5}
                                />
                                <Flex
                                    position="absolute"
                                    justifyContent="center"
                                    alignItems="center"
                                    top={0}
                                    left={0}
                                    w="100%"
                                    h="100%"
                                >
                                    <Button
                                        onClick={removecard}
                                        position="absolute"
                                        size="2xl"
                                        rounded="sm"
                                        variant="ghost"
                                    >
                                        <FiXCircle color="white" />
                                    </Button>
                                </Flex>
                            </Box>
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </Box>
    )
}

export default WishScreen
