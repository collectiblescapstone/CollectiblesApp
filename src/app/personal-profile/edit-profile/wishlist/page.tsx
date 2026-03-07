'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Box, Flex, Image, Button, Spinner, Text } from '@chakra-ui/react'
import { FiPlusCircle, FiXCircle } from 'react-icons/fi'
import { useAuth } from '@/context/AuthProvider'
import { getWishlist, updateWishlist } from '@/utils/wishlist/wishlistQueries'
import { getPokemonCards } from '@/utils/pokemonCard'
import { CardData } from '@/types/pokemon-card'
import { useRouter } from 'next/navigation'

const WishScreen: React.FC = () => {
    const router = useRouter()
    const { session, loading } = useAuth()
    const [loadingWishlist, setLoadingWishlist] = useState(true)
    const [removingCard, setRemovingCard] = useState(false)
    const [cards, setCards] = useState<CardData[]>([])

    const removeCard = useCallback(
        async (cardId: string) => {
            if (session?.user.id == undefined || removingCard) {
                return
            }

            setRemovingCard(true)
            try {
                await updateWishlist(session.user.id, cardId, true)

                // Remove cards locally than refetching
                setCards((prevCards) =>
                    prevCards.filter(({ id }) => id !== cardId)
                )
            } catch (e) {
                console.log(`Error removing card from wishlist: ${e}`)
            }
            setRemovingCard(false)
        },
        [session?.user.id, removingCard]
    )

    const addCard = useCallback(() => {
        router.push('/personal-profile/edit-profile/wishlist/add')
    }, [router])

    useEffect(() => {
        if (session?.user.id == undefined) {
            return
        }

        setLoadingWishlist(true)
        const fetchWishlistCards = async () => {
            const wishlistEntries = await getWishlist(session.user.id)
            const cardIds = wishlistEntries.map(({ cardId }) => cardId)
            const cards = await getPokemonCards({ ids: cardIds })
            setCards(cards)
            setLoadingWishlist(false)
        }

        fetchWishlistCards()
    }, [session?.user.id])

    return (
        <Box bg="white" minH="100vh" color="black">
            <Flex flexDirection="column" gap={6} mt={6}>
                {loading || !session || loadingWishlist ? (
                    <Flex
                        alignSelf={'center'}
                        alignItems={'center'}
                        flexDir={'column'}
                        gap={4}
                    >
                        <Text>Loading Wishlist</Text>
                        <Spinner size="xl" />
                    </Flex>
                ) : (
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
                                    onClick={() => {
                                        addCard()
                                    }}
                                    position="absolute"
                                    size="2xl"
                                    rounded="sm"
                                    variant="ghost"
                                >
                                    <FiPlusCircle color="white" />
                                </Button>
                            </Flex>
                        </Box>
                        {cards.map((card: CardData, index: number) => (
                            <Flex key={index}>
                                <Box
                                    position="relative"
                                    w="105px"
                                    h="auto"
                                    overflow="hidden"
                                >
                                    <Image
                                        src={card.image_url}
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
                                            onClick={() => {
                                                removeCard(card.id)
                                            }}
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
                )}
            </Flex>
        </Box>
    )
}

export default WishScreen
