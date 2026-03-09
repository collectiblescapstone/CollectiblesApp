'use client'

import {
    createContext,
    useContext,
    ReactNode,
    useEffect,
    useState
} from 'react'
import { CapacitorHttp } from '@capacitor/core'

// Types
import type { Set as DatabaseSet } from '@prisma/client'
import type { CardData } from '@/types/pokemon-card'
import type { PokemonCard, PokemonSet } from '@/types/Cards/frontend-card'

// Utils
import { baseUrl } from '@/utils/constants'
import { MAXPOKEDEXVALUE } from '@/utils/pokedex'

// let allCards: CardData[] = []

// API
export interface GetPokemonCardsFilters {
    ids: string[]
}

interface PokemonJSON {
    id: number
    name: string
}

// CONTEXT
type PokemonCardsContextType = {
    POKEMONGEN: number[]
    pokemonCards: Record<string, PokemonCard>
    pokemonSets: Record<string, PokemonSet>
    masterSetCards: Record<string, Set<string>>
    pokemonMasterSetCards: Record<number, Set<string>>
    allCards: CardData[]
    getCardsBySetId: (setId: string) => Promise<Record<string, PokemonCard>>
    getCardsByName: (name: string) => Promise<Record<string, PokemonCard>>
    getCardsByPokedex: (pId: number) => Promise<Record<string, PokemonCard>>
    grandmasterSetCount: (setId: string) => Promise<number>
    pokemonGrandmasterSetCount: (pokedexId: number) => Promise<number>
    getFilteredCards: (filters: GetPokemonCardsFilters) => Promise<CardData[]>
    getPokemonName: (id: number) => Promise<string>
    getGeneration: (dexNumber: number) => number
}

const PokemonCardsContext = createContext<PokemonCardsContextType | undefined>(
    undefined
)

const getPokemonCards = async (
    filters?: GetPokemonCardsFilters
): Promise<CardData[]> => {
    let allCards: CardData[] = []
    if (allCards.length !== 0) {
        if (filters?.ids) {
            const filteredCards = allCards.filter((card) =>
                filters.ids.includes(card.id)
            )
            return filteredCards
        }
        return allCards
    }
    const response = await CapacitorHttp.post({
        url: `${baseUrl}/api/pokemon-card`,
        data: filters ?? {},
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to fetch /api/pokemon-card')
    }
    allCards = await response.data
    return allCards
}

// PROVIDER
export const PokemonCardsProvider = ({ children }: { children: ReactNode }) => {
    // Local state for cards and sets
    const [pokemonCards, setPokemonCards] = useState<
        Record<string, PokemonCard>
    >({})
    const [pokemonSets, setPokemonSets] = useState<Record<string, PokemonSet>>(
        {}
    )

    // Local state for master and grandmaster sets

    // Set counts based on set
    const [masterSetCards, setMasterSetCards] = useState<
        Record<string, Set<string>>
    >({})
    const [grandmasterSetCards, setGrandmasterSetCards] = useState<
        Record<string, Record<string, Set<string>>>
    >({})

    // Set counts based on Pokedex ID
    const [pokemonMasterSetCards, setPokemonMasterSetCards] = useState<
        Record<number, Set<string>>
    >({})
    const [pokemonGrandmasterSet, setPokemonGrandmasterSet] = useState<
        Record<number, Record<string, Set<string>>>
    >({})

    // Local state for all cards (NO FILTERS)
    const [allCards, setAllCards] = useState<CardData[]>([])

    // Local state for Pokedex data
    const [pokedexData, setPokedexData] = useState<string[]>([])

    useEffect(() => {
        // FETCHERS
        const fetchPokemonCards = async (): Promise<void> => {
            const tempCards: Record<string, PokemonCard> = {}
            try {
                const cards = await getPokemonCards()
                setAllCards(cards)

                const tempMasterSetCards: Record<string, Set<string>> = {}
                const tempGrandmasterSetCards: Record<
                    string,
                    Record<string, Set<string>>
                > = {}
                const tempPokemonMasterSetCards: Record<
                    string,
                    Set<string>
                > = {}
                const tempPokemonGrandmasterSet: Record<
                    string,
                    Record<string, Set<string>>
                > = {}

                for (const pokemonCard of cards) {
                    tempCards[pokemonCard.id.toString()] = {
                        name: pokemonCard.name,
                        category: pokemonCard.category,
                        types: pokemonCard.types,
                        illustrator: pokemonCard.illustrator || '',
                        rarity: pokemonCard.rarity,
                        variants: pokemonCard.variants || [],
                        dexId: pokemonCard.dexId,
                        image_url: pokemonCard.image_url,
                        setId: pokemonCard.setId
                    }

                    const setId = pokemonCard.setId

                    // Add to master and grandmaster sets

                    if (setId) {
                        if (!tempMasterSetCards[setId])
                            tempMasterSetCards[setId] = new Set<string>()
                        tempMasterSetCards[setId].add(pokemonCard.id.toString())

                        if (!tempGrandmasterSetCards[setId])
                            tempGrandmasterSetCards[setId] = {}
                        if (
                            !tempGrandmasterSetCards[setId][
                                pokemonCard.id.toString()
                            ]
                        )
                            tempGrandmasterSetCards[setId][
                                pokemonCard.id.toString()
                            ] = new Set<string>()
                        pokemonCard.variants.forEach((variant) => {
                            tempGrandmasterSetCards[setId][
                                pokemonCard.id.toString()
                            ].add(variant)
                        })
                    }

                    // Add cards to the Pokemon master and grandmaster sets
                    // Sorted by dexId
                    const dexIds = pokemonCard.dexId || []

                    for (const dexId of dexIds) {
                        if (dexId > MAXPOKEDEXVALUE) continue

                        if (!tempPokemonMasterSetCards[dexId])
                            tempPokemonMasterSetCards[dexId] = new Set<string>()
                        tempPokemonMasterSetCards[dexId].add(
                            pokemonCard.id.toString()
                        )

                        if (!tempPokemonGrandmasterSet[dexId])
                            tempPokemonGrandmasterSet[dexId] = {}
                        if (
                            !tempPokemonGrandmasterSet[dexId][
                                pokemonCard.id.toString()
                            ]
                        ) {
                            tempPokemonGrandmasterSet[dexId][
                                pokemonCard.id.toString()
                            ] = new Set<string>()
                        }
                        pokemonCard.variants.forEach((variant) => {
                            tempPokemonGrandmasterSet[dexId][
                                pokemonCard.id.toString()
                            ].add(variant)
                        })
                    }
                }

                // Populate the state with the fetched cards and sets
                setMasterSetCards(tempMasterSetCards)
                setGrandmasterSetCards(tempGrandmasterSetCards)
                setPokemonMasterSetCards(tempPokemonMasterSetCards)
                setPokemonGrandmasterSet(tempPokemonGrandmasterSet)
                setPokemonCards(tempCards)
            } catch (err) {
                console.error('Fetch error for pokemon cards:', err)
            }
        }

        const fetchPokemonSets = async (): Promise<void> => {
            try {
                const response = await fetch('/api/pokemon-set')
                if (!response.ok)
                    throw new Error(`Failed to fetch /api/pokemon-set`)
                const sets: DatabaseSet[] = await response.json()

                const tempSets: Record<string, PokemonSet> = {}
                for (const pokemonSet of sets) {
                    tempSets[pokemonSet.id.toString()] = {
                        name: pokemonSet.name,
                        series: pokemonSet.series,
                        logo: pokemonSet.logo || '',
                        symbol: pokemonSet.symbol || '',
                        official: pokemonSet.official,
                        total: pokemonSet.total
                    }
                }
                setPokemonSets(tempSets)
            } catch (err) {
                console.error('Fetch error for pokemon sets:', err)
            }
        }

        const fetchPokedex = async () => {
            const tempPokedexData: string[] = []
            try {
                const specifiedCards = await fetch('/Pokedex/pokedex.json')
                const pokedexDataJSON: PokemonJSON[] =
                    await specifiedCards.json()
                for (const pokemon of pokedexDataJSON) {
                    tempPokedexData.push(pokemon.name)
                }
                setPokedexData(tempPokedexData)
            } catch (err) {
                console.error('Fetch error for pokedex:', err)
            }
        }
        fetchPokedex()
        fetchPokemonCards()
        fetchPokemonSets()
    }, [])

    const POKEMONGEN = [151, 251, 386, 493, 649, 721, 809, 905, 1025]

    /**
     * Returns Pokemon cards that belongs to a specific set
     * @param setId
     * @returns
     */
    const getCardsBySetId = async (
        setId: string
    ): Promise<Record<string, PokemonCard>> => {
        const filteredCards: Record<string, PokemonCard> = {}
        for (const [id, card] of Object.entries(pokemonCards)) {
            if (card.setId === setId) {
                filteredCards[id] = card
            }
        }
        return filteredCards
    }

    /**
     * Retrieves Pokemon cards with the Pokemon name
     * @param name
     * @returns
     */
    const getCardsByName = async (
        name: string
    ): Promise<Record<string, PokemonCard>> => {
        const filteredCards: Record<string, PokemonCard> = {}
        for (const [id, card] of Object.entries(pokemonCards)) {
            if (card.name.includes(name)) {
                filteredCards[id] = card
            }
        }
        return filteredCards
    }

    /**
     * Retrieves Pokemon cards with the Pokemon name
     * @param name
     * @returns
     */
    const getCardsByPokedex = async (
        pId: number
    ): Promise<Record<string, PokemonCard>> => {
        const filteredCards: Record<string, PokemonCard> = {}
        for (const [id, card] of Object.entries(pokemonCards)) {
            if (card.dexId.includes(pId)) {
                filteredCards[id] = card
            }
        }
        return filteredCards
    }

    /**
     * @param userId
     * @param setId
     * @returns
     */
    const grandmasterSetCount = async (setId: string): Promise<number> => {
        const setData = grandmasterSetCards[setId]
        if (!setData) return 0

        let count = 0

        for (const cardId in setData) {
            count += setData[cardId].size
        }

        return count
    }

    /**
     * Calculates the grandmaster set count based on the pokemonId
     * @param userId
     * @param pokemonId
     * @returns
     */
    const pokemonGrandmasterSetCount = async (
        pokedexId: number
    ): Promise<number> => {
        const pokeData = pokemonGrandmasterSet[pokedexId]
        if (!pokeData) return 0

        let count = 0

        for (const cardId in pokeData) {
            count += pokeData[cardId].size
        }

        return count
    }

    /**
     * Returns all the filtered cards
     * @param filters
     * @returns
     */
    const getFilteredCards = async (
        filters: GetPokemonCardsFilters
    ): Promise<CardData[]> => {
        return getPokemonCards(filters)
    }

    /**
     * Returns the Pokemon name based on the Pokedex ID
     * @param id
     * @returns
     */
    const getPokemonName = async (id: number): Promise<string> => {
        if (id < 1 || id > 1025) return 'N/A'
        return pokedexData[id - 1]
    }

    /**
     * Returns the Pokemon generation based on the Pokedex ID
     * @param dexNumber
     * @returns
     */
    const getGeneration = (dexNumber: number) => {
        for (let i = 0; i < POKEMONGEN.length; i++) {
            if (dexNumber <= POKEMONGEN[i] && dexNumber > 0) return i + 1
        }
        return 0
    }

    return (
        <PokemonCardsContext.Provider
            value={{
                POKEMONGEN,
                pokemonCards,
                pokemonSets,
                masterSetCards,
                pokemonMasterSetCards,
                allCards,
                getCardsBySetId,
                getCardsByPokedex,
                getCardsByName,
                grandmasterSetCount,
                pokemonGrandmasterSetCount,
                getFilteredCards,
                getPokemonName,
                getGeneration
            }}
        >
            {children}
        </PokemonCardsContext.Provider>
    )
}

// HOOK
export const usePokemonCards = () => {
    const context = useContext(PokemonCardsContext)

    if (!context) {
        throw new Error(
            'usePokemonCards must be used within a PokemonCardsProvider'
        )
    }

    return context
}
