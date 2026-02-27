'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    Box,
    Flex,
    HStack,
    Heading,
    IconButton,
    Spinner,
    Text
} from '@chakra-ui/react'
import { LuChevronUp, LuChevronDown } from 'react-icons/lu'

// Child Components
import PokemonCardMini from '@/components/pokemon-cards/pokemon-card-mini/PokemonCardMini'
import CardFilter from '@/components/card-filter/CardFilter'

// Hooks
import { useFilters } from '@/hooks/useFilters'

// Utils
import { userMasterSet, userPokemonMasterSet } from '@/utils/userPokemonCard'
import { getPokemonName, getGeneration } from '@/utils/pokedex'

// Types
import type { CardData } from '@/types/pokemon-card'
import { useAuth } from '@/context/AuthProvider'
import { getPokemonCards } from '@/utils/pokemonCard'
import { CardSearch } from '@/components/card-filter/CardSearch'

const FilterCardsContent: React.FC = () => {
    // Search Params
    const searchParams = useSearchParams()
    const type = searchParams.get('type')
    const setId = searchParams.get('setId')
    const pId = searchParams.get('pId')
    const setName = searchParams.get('setName')

    // Filters from context
    const { filters } = useFilters()
    const { session, loading: authLoading } = useAuth()

    // Filters from search
    const [filteredIds, setFilteredIds] = useState<string[]>()

    // Local States
    const [pokemonName, setPokemonName] = useState<string | null>(null)
    const [cards, setCards] = useState<CardData[]>([])
    const [cardNumbers, setCardNumbers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [ascending, setAscending] = useState(true)
    const [userCards, setUserCards] = useState<string[]>([])

    // Fetch cards based on type & params
    useEffect(() => {
        const loadData = async () => {
            if (!type) {
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                const cards = await getPokemonCards()
                const filteredCards = cards.filter((card) => {
                    if (type === 'set') {
                        return card.setId === setId
                    }

                    if (type === 'pokemon') {
                        return (
                            Array.isArray(card.dexId) &&
                            card.dexId.includes(Number(pId))
                        )
                    }

                    return true
                })

                // Get the user card data
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

                const cardNums: Record<string, string> = {}
                for (const card of filteredCards) {
                    const splitId = card.id.split('-')
                    cardNums[card.id] = splitId[splitId.length - 1]
                }

                // Sort by numeric id
                filteredCards.sort(
                    (a: CardData, b: CardData) =>
                        Number(cardNums[a.id]) - Number(cardNums[b.id])
                )

                setCards(Array.isArray(filteredCards) ? filteredCards : [])
                setCardNumbers(cardNums)
            } catch (error) {
                console.error('Error loading data:', error)
                setCards([])
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [type, setId, pId, session?.user?.id])

    // Fetch Pokémon name if viewing a single Pokémon
    useEffect(() => {
        if (type === 'pokemon' && pId) {
            getPokemonName(Number(pId)).then(setPokemonName)
        } else {
            setPokemonName(null)
        }
    }, [type, pId])

    // Reverse card order
    const toggleSortOrder = () => {
        setAscending((prev) => !prev)
        setCards((prevCards) => [...prevCards].reverse())
    }

    // Filter cards based on FiltersContext
    const filteredCards = cards.filter((card) => {
        // Filtered Ids
        if (filteredIds) {
            return filteredIds.includes(card.id)
        }

        // CATEGORY
        if (
            !filters.categories.includes(card.category) &&
            !(
                card.category === 'Pokemon' &&
                filters.categories.includes('Pokémon')
            )
        )
            return false

        // TYPE
        if (card.types?.length) {
            const hasEnabledType = card.types.some(
                (type) => filters.types[type]
            )
            if (!hasEnabledType) return false
        }

        // GENERATION
        if (card.dexId?.length) {
            const matchesGeneration = card.dexId.some((dexNumber) => {
                const generation = getGeneration(dexNumber)
                return filters.generations.includes(generation)
            })
            if (!matchesGeneration) return false
        }

        return true
    })

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
                            : `${type === 'set' ? setName : pokemonName} Cards`}
                    </Heading>
                    <Flex gap={1} align="right">
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
            {filteredCards.length === 0 ? (
                <Text>No cards match the selected filters.</Text>
            ) : (
                <HStack justify="center" gap={4} flexWrap="wrap" mb={4}>
                    {filteredCards.map((card, index) => (
                        <PokemonCardMini
                            key={index}
                            cardName={card.name}
                            cardId={
                                cardNumbers[card.id] +
                                (Number(card.set.official) > 0
                                    ? '/' + card.set.official
                                    : '')
                            }
                            cardOwned={userCards.includes(card.id)}
                            image={card.image_url}
                        />
                    ))}
                </HStack>
            )}
        </Box>
    )
}

export default FilterCardsContent
