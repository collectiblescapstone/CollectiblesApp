'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    Box,
    Flex,
    HStack,
    VStack,
    Heading,
    IconButton,
    Spinner
} from '@chakra-ui/react'
import { LuChevronUp, LuChevronDown } from 'react-icons/lu'

// Components
import PokemonCardMini from '@/components/pokemon-cards/pokemon-card-mini/PokemonCardMini'
import CardFilter from '@/components/card-filter/CardFilter'
import { CardSearch } from '@/components/card-filter/CardSearch'

// Context
import { useAuth } from '@/context/AuthProvider'
import { usePokemonCards } from '@/context/PokemonCardsProvider'

// Hooks
import { useFilters } from '@/hooks/useFilters'

// Utils
import { userMasterSet, userPokemonMasterSet } from '@/utils/userPokemonCard'
import { sortCardId } from '@/utils/sortCardId'
import { formatCardNumber } from '@/utils/formatCardNumber'

// Types
import type { CardData } from '@/types/pokemon-card'

const FilterCardsContent = () => {
    const searchParams = useSearchParams()
    const type = searchParams.get('type')
    const setId = searchParams.get('setId')
    const pId = searchParams.get('pId')
    const setName = searchParams.get('setName')

    const { filters } = useFilters()
    const { session, loading: authLoading } = useAuth()

    const [filteredIds, setFilteredIds] = useState<string[]>()
    const [pokemonName, setPokemonName] = useState<string | null>(null)
    const [cards, setCards] = useState<CardData[]>([])
    const [cardNumbers, setCardNumbers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [ascending, setAscending] = useState(true)
    const [userCards, setUserCards] = useState<string[]>([])

    const {
        allCards,
        getPokemonName,
        getGeneration,
        pokemonSubsets,
        pokemonSets
    } = usePokemonCards()

    // Load cards
    useEffect(() => {
        const loadData = async () => {
            if (!type) {
                setLoading(false)
                return
            }

            setLoading(true)

            try {
                let filteredCards = allCards.filter((card) => {
                    if (type === 'set') return card.setId === setId
                    if (type === 'pokemon')
                        return card.dexId?.includes(Number(pId))
                    return true
                })

                if (session?.user?.id) {
                    if (type === 'set') {
                        const userCards = await userMasterSet(
                            session.user.id,
                            setId!
                        )
                        setUserCards(userCards)
                    } else {
                        const userCards = await userPokemonMasterSet(
                            session.user.id,
                            Number(pId)
                        )
                        setUserCards(userCards)
                    }
                }

                filteredCards = filteredCards
                    .slice()
                    .sort((a, b) => sortCardId(a.id, b.id))

                const cardNums: Record<string, string> = {}
                for (const card of filteredCards) {
                    const splitId = card.id.split('-')
                    cardNums[card.id] = splitId[splitId.length - 1]
                }

                filteredCards.sort(
                    (a, b) => Number(cardNums[a.id]) - Number(cardNums[b.id])
                )
                setCards(filteredCards)
                setCardNumbers(cardNums)
            } catch (err) {
                console.error('Error loading data:', err)
                setCards([])
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [type, setId, pId, session?.user?.id, allCards])

    // Load Pokémon name
    useEffect(() => {
        if (type === 'pokemon' && pId) {
            getPokemonName(Number(pId)).then(setPokemonName)
        } else {
            setPokemonName(null)
        }
    }, [type, pId, getPokemonName, getGeneration])

    // Toggle sort
    const toggleSortOrder = () => {
        setAscending((prev) => !prev)
        setCards((prev) => [...prev].reverse())
    }

    // Filter by category/type/generation
    const filteredCards = cards.filter((card) => {
        if (filteredIds) return filteredIds.includes(card.id)

        if (
            !filters.categories.includes(card.category) &&
            !(
                card.category === 'Pokemon' &&
                filters.categories.includes('Pokémon')
            )
        )
            return false

        if (card.types?.length) {
            if (!card.types.some((type) => filters.types[type])) return false
        }

        if (card.dexId?.length) {
            if (
                !card.dexId.some((dexNumber) =>
                    filters.generations.includes(getGeneration(dexNumber))
                )
            )
                return false
        }

        return true
    })

    // Group cards for display
    const groupedCards = useMemo(() => {
        if (!setId) return { base: filteredCards, subsets: {} }

        const base: CardData[] = []
        const subsets: Record<string, CardData[]> = {}

        for (const card of filteredCards) {
            const number = cardNumbers[card.id] || ''
            const prefixMatch = number.match(/^[A-Za-z]+/)
            const prefix = prefixMatch ? prefixMatch[0] : null

            if (!prefix) base.push(card)
            else {
                if (!subsets[prefix]) subsets[prefix] = []
                subsets[prefix].push(card)
            }
        }

        return { base, subsets }
    }, [filteredCards, cardNumbers, setId])

    if (loading || authLoading || !session)
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )

    return (
        <Box>
            <Flex mb={6} flexDirection="column" pl={5} pr={5} pt={5}>
                <Flex justify="space-between" align="center">
                    <Heading>
                        {type === 'set'
                            ? `${setName} Card Set`
                            : `${pokemonName} Cards`}
                    </Heading>

                    <Flex gap={1}>
                        <IconButton
                            aria-label="Toggle sort order"
                            size="lg"
                            variant="ghost"
                            onClick={toggleSortOrder}
                        >
                            {ascending ? <LuChevronUp /> : <LuChevronDown />}
                        </IconButton>

                        <CardFilter />
                    </Flex>
                </Flex>

                <CardSearch cards={cards} setFilteredIds={setFilteredIds} />
            </Flex>

            <VStack gap={8} width="100%">
                {/* Base set */}
                {groupedCards.base.length > 0 && (
                    <Box>
                        <HStack justify="center" gap={4} flexWrap="wrap">
                            {groupedCards.base.map((card, idx) => (
                                <PokemonCardMini
                                    key={idx}
                                    cardId={card.id}
                                    cardName={card.name}
                                    image={card.image_url}
                                    cardOwned={userCards.includes(card.id)}
                                    cardSetId={formatCardNumber(
                                        card.id,
                                        cardNumbers[card.id],
                                        card.setId,
                                        pokemonSets[card.setId]?.official,
                                        pokemonSubsets
                                    )}
                                />
                            ))}
                        </HStack>
                    </Box>
                )}

                {/* Subsets */}
                {Object.entries(groupedCards.subsets).map(
                    ([prefix, subsetCards]) => {
                        const subset = pokemonSubsets[setId!]?.find(
                            (s) => s.prefix === prefix
                        )
                        return (
                            <Flex
                                mb={6}
                                key={prefix}
                                flexDirection="column"
                                pl={5}
                                pr={5}
                                pt={5}
                            >
                                <Heading size="lg" mb={3}>
                                    {subset?.name ?? prefix}
                                </Heading>
                                <HStack
                                    justify="center"
                                    gap={4}
                                    flexWrap="wrap"
                                >
                                    {subsetCards.map((card, idx) => (
                                        <PokemonCardMini
                                            key={idx}
                                            cardId={card.id}
                                            cardName={card.name}
                                            image={card.image_url}
                                            cardOwned={userCards.includes(
                                                card.id
                                            )}
                                            cardSetId={formatCardNumber(
                                                card.id,
                                                cardNumbers[card.id],
                                                card.setId,
                                                pokemonSets[card.setId]
                                                    ?.official,
                                                pokemonSubsets
                                            )}
                                        />
                                    ))}
                                </HStack>
                            </Flex>
                        )
                    }
                )}
            </VStack>
        </Box>
    )
}

export default FilterCardsContent
