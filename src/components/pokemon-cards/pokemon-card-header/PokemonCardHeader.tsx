'use client'

import React, { useEffect, useState } from 'react'
import { Box, Image, HStack, VStack, Spinner, Text } from '@chakra-ui/react'

// Context
import { useAuth } from '@/context/AuthProvider'

// Icons
import { FaPaintBrush } from "react-icons/fa";

// Types
import type { PokemonCard } from '@/utils/pokemonCard'

// Utils
import { getCardInformation } from '@/utils/pokemonCard'
import { getRarityImage } from '@/utils/cardInfo/raritytoImage'



interface PokemonCardHeaderProps {
    cardId: string
}

const PokemonCardHeader = ({
    cardId
}: PokemonCardHeaderProps) => {

    const { session, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)

    const [cardInfo, setCardInfo] = useState<PokemonCard | null>(null)

    useEffect(() => {
        const fetchCardInfo = async () => {
            setLoading(true)
            try {
                const fetchedCardInfo = await getCardInformation(cardId)
                setCardInfo(fetchedCardInfo || null)
                console.log('Card Info:', fetchedCardInfo)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching card information:', error)
                setLoading(false)
            }
        }
        fetchCardInfo()
    }, [cardId])

    if (loading || authLoading || !session || !cardInfo)
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )

    return (
        <Box
            padding={4}
        >

            <HStack gap={4} align="center" width={"100%"}>
                <Box
                    bg="gray.50"
                    w={{ base: '40vw', md: '100%' }}
                    borderRadius="md"
                    overflow="hidden"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                >
                    <Image
                        src={
                            cardInfo.image_url !== 'undefined/low.png' && cardInfo.image_url !== ''
                                ? cardInfo.image_url
                                : '/Images/PokemonCardBack.jpg'
                        }
                        alt={cardInfo.name}
                        objectFit="contain"
                        width="100%"
                        style={{
                            imageRendering: 'auto',
                            transform: 'translateZ(0)'
                        }}
                    />

                </Box>

                <Box
                    w="1px"
                    h="full"
                    bg="gray.300"
                />

                <VStack align="start" h="full" gap={4}>
                    <Text fontSize="xl" fontWeight="bold">
                        {cardInfo.name}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                        {cardInfo.category}
                    </Text>
                    <HStack gap={2}>
                        <FaPaintBrush />
                        <Text fontSize="sm" fontWeight="bold">
                            {cardInfo.illustrator}
                        </Text>
                    </HStack>
                    <HStack gap={2}>
                        <Image src={getRarityImage(cardInfo.rarity)} alt={cardInfo.rarity} width="100px" height="100px" />
                        <Text fontSize="sm" fontWeight="bold">
                            {cardInfo.rarity}
                        </Text>
                    </HStack>
                </VStack>
            </HStack>

        </Box>
    )
}

export default PokemonCardHeader
