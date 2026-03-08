'use client'

import React, { useEffect, useState } from 'react'
import { Box, Image, HStack, VStack, Spinner, Text } from '@chakra-ui/react'

// Context
import { usePokemonCards } from '@/context/PokemonCardsProvider'

// Icons
import { FaPaintBrush, FaTools } from 'react-icons/fa'

// Types
import type { PokemonCard } from '@/types/Cards/frontend-card'

// Utils
import { capitalizeEachWord } from '@/utils/capitalize'
import {
    checkRarityExists,
    getRarityImage
} from '@/utils/cardInfo/raritytoImage'

interface PokemonCardHeaderProps {
    cardId: string
}

const PokemonCardHeader = ({ cardId }: PokemonCardHeaderProps) => {
    const [loading, setLoading] = useState(true)
    const [setCount, setSetCount] = useState<number>(0)
    const [setName, setSetName] = useState<string>('')

    const [cardInfo, setCardInfo] = useState<PokemonCard | null>(null)

    // Context
    const { getCardInformation, getSetInfo } = usePokemonCards()

    useEffect(() => {
        let isMounted = true

        const fetchCardInfo = async () => {
            setLoading(true)
            try {
                const fetchedCardInfo = await getCardInformation(cardId)

                if (!isMounted) return

                setCardInfo(fetchedCardInfo || null)

                if (!fetchedCardInfo?.setId) {
                    setSetCount(0)
                    setSetName('')
                    setLoading(false)
                    return
                }

                const set = await getSetInfo(fetchedCardInfo?.setId || '')

                if (!isMounted) return

                setSetCount(set?.official || 0)
                setSetName(set?.name || '')
                setLoading(false)
            } catch (error) {
                console.error('Error fetching card information:', error)
                if (!isMounted) return
                setLoading(false)
            }
        }

        fetchCardInfo()

        return () => {
            isMounted = false
        }
    }, [cardId, getCardInformation, getSetInfo])

    if (loading || !cardInfo)
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )

    const splitId = cardId.split('-')[1]

    return (
        <Box
            padding={4}
            width={{ base: '100%', md: '100%' }}
            justifyContent="center"
            display="flex"
            alignItems="center"
        >
            <HStack gap={4} align="center" width={'100%'}>
                <Box
                    bg="gray.50"
                    width={'50%'}
                    borderRadius="md"
                    overflow="hidden"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                >
                    <Image
                        src={
                            cardInfo.image_url !== 'undefined/low.png' &&
                            cardInfo.image_url !== ''
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

                <Box w="1px" h="full" bg="gray.300" />

                <VStack align="start" h="full" gap={4}>
                    <Text fontSize="xl" fontWeight="bold">
                        {cardInfo.name}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                        {splitId + (setCount > 0 ? '/' + setCount : '')}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                        {setName}
                    </Text>
                    {cardInfo.category === 'Pokemon' && (
                        <HStack gap={2} align="center">
                            <Image
                                src="/Images/PokeBall.svg"
                                alt="Pokémon"
                                height="1em"
                                width="auto"
                            />
                            <Text fontSize="sm" fontWeight="bold">
                                Pokémon
                            </Text>
                        </HStack>
                    )}
                    {cardInfo.category === 'Trainer' && (
                        <HStack gap={2} align="center">
                            <FaTools height="1em" width="auto" />
                            <Text fontSize="sm" fontWeight="bold">
                                Trainer
                            </Text>
                        </HStack>
                    )}
                    <HStack gap={2} align="center">
                        <Image
                            src={getRarityImage(
                                checkRarityExists(cardInfo.rarity)
                                    ? cardInfo.rarity
                                    : 'Common'
                            )}
                            alt={cardInfo.rarity}
                            height="1em"
                            width="auto"
                        />
                        <Text fontSize="sm" fontWeight="bold">
                            {capitalizeEachWord(
                                checkRarityExists(cardInfo.rarity)
                                    ? cardInfo.rarity
                                    : 'Common'
                            )}
                        </Text>
                    </HStack>
                    <HStack gap={2}>
                        <FaPaintBrush />
                        <Text fontSize="sm" fontWeight="bold">
                            {cardInfo.illustrator}
                        </Text>
                    </HStack>
                </VStack>
            </HStack>
        </Box>
    )
}

export default PokemonCardHeader
