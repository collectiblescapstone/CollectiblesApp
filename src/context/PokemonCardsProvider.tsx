'use client'

import { createContext, useContext, ReactNode } from 'react'
import { CapacitorHttp } from '@capacitor/core'

// Types
import type { Set as DatabaseSet } from '@prisma/client'
import type { CardData } from '@/types/pokemon-card'
import type { PokemonCard, PokemonSet } from '@/types/Cards/frontend-card'

// Utils
import { baseUrl } from '@/utils/constants'
import { MAXPOKEDEXVALUE } from '@/utils/pokedex'

// GLOBAL CACHES
const pokemonCards: Record<string, PokemonCard> = {}
const pokemonSets: Record<string, PokemonSet> = {}

// Set counts based on set
const masterSetCards: Record<string, Set<string>> = {}
const grandmasterSetCards: Record<string, Record<string, Set<string>>> = {}

// Set counts based on Pokedex ID
const pokemonMasterSetCards: Record<number, Set<string>> = {}
const pokemonGrandmasterSet: Record<number, Record<string, Set<string>>> = {}

let allCards: CardData[] = []

// API
export interface GetPokemonCardsFilters {
    ids: string[]
}

export const getPokemonCards = async (
    filters?: GetPokemonCardsFilters
): Promise<CardData[]> => {
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

// FETCHERS
const fetchPokemonCards = async (): Promise<void> => {
    try {
        const cards = await getPokemonCards()

        for (const pokemonCard of cards) {
            pokemonCards[pokemonCard.id.toString()] = {
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
                if (!masterSetCards[setId])
                    masterSetCards[setId] = new Set<string>()
                masterSetCards[setId].add(pokemonCard.id.toString())

                if (!grandmasterSetCards[setId]) grandmasterSetCards[setId] = {}
                if (!grandmasterSetCards[setId][pokemonCard.id.toString()])
                    grandmasterSetCards[setId][pokemonCard.id.toString()] =
                        new Set<string>()
                pokemonCard.variants.forEach((variant) => {
                    grandmasterSetCards[setId][pokemonCard.id.toString()].add(
                        variant
                    )
                })
            }

            // Add cards to the Pokemon master and grandmaster sets
            // Sorted by dexId
            const dexIds = pokemonCard.dexId || []

            for (const dexId of dexIds) {
                if (dexId > MAXPOKEDEXVALUE) continue

                if (!pokemonMasterSetCards[dexId])
                    pokemonMasterSetCards[dexId] = new Set<string>()
                pokemonMasterSetCards[dexId].add(pokemonCard.id.toString())

                if (!pokemonGrandmasterSet[dexId])
                    pokemonGrandmasterSet[dexId] = {}
                if (!pokemonGrandmasterSet[dexId][pokemonCard.id.toString()]) {
                    pokemonGrandmasterSet[dexId][pokemonCard.id.toString()] =
                        new Set<string>()
                }
                pokemonCard.variants.forEach((variant) => {
                    pokemonGrandmasterSet[dexId][pokemonCard.id.toString()].add(
                        variant
                    )
                })
            }
        }
    } catch (err) {
        console.error('Fetch error for pokemon cards:', err)
    }
}

const fetchPokemonSets = async (): Promise<void> => {
    try {
        const response = await fetch('/api/pokemon-set')
        if (!response.ok) throw new Error(`Failed to fetch /api/pokemon-set`)
        const sets: DatabaseSet[] = await response.json()

        for (const pokemonSet of sets) {
            pokemonSets[pokemonSet.id.toString()] = {
                name: pokemonSet.name,
                series: pokemonSet.series,
                logo: pokemonSet.logo || '',
                symbol: pokemonSet.symbol || '',
                official: pokemonSet.official,
                total: pokemonSet.total
            }
        }
    } catch (err) {
        console.error('Fetch error for pokemon sets:', err)
    }
}

// CONTEXT
type PokemonCardsContextType = {
    getCardInformation: (id: string) => Promise<PokemonCard | undefined>
    getCardsBySetId: (setId: string) => Promise<Record<string, PokemonCard>>
    getCardsByName: (name: string) => Promise<Record<string, PokemonCard>>
    getCardsByPokedex: (pId: number) => Promise<Record<string, PokemonCard>>
    getSetInformation: (id: string) => Promise<PokemonSet | undefined>
    masterSetCount: (setId: string) => Promise<number | undefined>
    grandmasterSetCount: (setId: string) => Promise<number>
    pokemonMasterSetCount: (pokedexId: number) => Promise<number>
    pokemonGrandmasterSetCount: (pokedexId: number) => Promise<number>
    getAllCards: (filters?: GetPokemonCardsFilters) => Promise<CardData[]>
    getSetName: (id: string) => Promise<string | undefined>
    getSetInfo: (id: string) => Promise<PokemonSet | undefined>
}

const PokemonCardsContext = createContext<PokemonCardsContextType | undefined>(
    undefined
)

// PROVIDER
export const PokemonCardsProvider = ({ children }: { children: ReactNode }) => {
    /**
     * Retrieves a Pokemon card from the cache or fetches it if not available
     * @param id
     * @returns
     */
    const getCardInformation = async (
        id: string
    ): Promise<PokemonCard | undefined> => {
        if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards()
        return pokemonCards[id]
    }

    /**
     * Returns Pokemon cards that belongs to a specific set
     * @param setId
     * @returns
     */
    const getCardsBySetId = async (
        setId: string
    ): Promise<Record<string, PokemonCard>> => {
        if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards()
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
        if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards()
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
        if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards()
        const filteredCards: Record<string, PokemonCard> = {}
        for (const [id, card] of Object.entries(pokemonCards)) {
            if (card.dexId.includes(pId)) {
                filteredCards[id] = card
            }
        }
        return filteredCards
    }

    /**
     * Retrieves the set information for Pokemon
     * @param id
     * @returns
     */
    const getSetInformation = async (
        id: string
    ): Promise<PokemonSet | undefined> => {
        if (Object.keys(pokemonSets).length === 0) await fetchPokemonSets()
        return pokemonSets[id]
    }

    /**
     * Get the master set cards for a user based on setId
     * @param userId
     * @param setId
     * @returns
     */
    const masterSet = async (setId: string): Promise<string[]> => {
        if (Object.keys(masterSetCards).length === 0) await fetchPokemonCards()
        return Array.from(masterSetCards[setId] ?? new Set<string>())
    }

    /**
     * Gets the total cards for the master set based on setId
     * @param userId
     * @param setId
     * @returns
     */
    const masterSetCount = async (setId: string): Promise<number> => {
        return masterSet(setId).then((cards) => cards.length)
    }

    /**
     * Calculates the grandmaster set count based on the setId
     * WILL NEED TO REFACTOR FOR THE SHOW ALL CARDS PAGE
     * @param userId
     * @param setId
     * @returns
     */
    const grandmasterSetCount = async (setId: string): Promise<number> => {
        if (Object.keys(grandmasterSetCards).length === 0)
            await fetchPokemonCards()

        const setData = grandmasterSetCards[setId]
        if (!setData) return 0

        let count = 0

        for (const cardId in setData) {
            count += setData[cardId].size
        }

        return count
    }

    /**
     * Get the master set cards for a user based on pokemonId
     * @param userId
     * @param pokemonId
     * @returns
     */
    const pokemonMasterSet = async (pokedexId: number): Promise<string[]> => {
        if (Object.keys(pokemonMasterSetCards).length === 0)
            await fetchPokemonCards()

        return Array.from(pokemonMasterSetCards[pokedexId] || new Set<string>())
    }

    /**
     * Gets the total cards for the master set based on pokemonId
     * @param pokemonId
     * @returns
     */
    const pokemonMasterSetCount = async (
        pokedexId: number
    ): Promise<number> => {
        return pokemonMasterSet(pokedexId).then((cards) => cards.length)
    }

    /**
     * Calculates the grandmaster set count based on the pokemonId
     * WILL NEED TO REFACTOR FOR THE SHOW ALL CARDS PAGE
     * @param userId
     * @param pokemonId
     * @returns
     */
    const pokemonGrandmasterSetCount = async (
        pokedexId: number
    ): Promise<number> => {
        if (Object.keys(pokemonGrandmasterSet).length === 0)
            await fetchPokemonCards()

        const pokeData = pokemonGrandmasterSet[pokedexId]
        if (!pokeData) return 0

        let count = 0

        for (const cardId in pokeData) {
            count += pokeData[cardId].size
        }

        return count
    }

    const getAllCards = async (
        filters?: GetPokemonCardsFilters
    ): Promise<CardData[]> => {
        return getPokemonCards(filters)
    }

    const getSetName = async (id: string): Promise<string | undefined> => {
        if (Object.keys(pokemonSets).length === 0) await fetchPokemonSets()
        return pokemonSets[id]?.name
    }

    const getSetInfo = async (id: string): Promise<PokemonSet | undefined> => {
        if (Object.keys(pokemonSets).length === 0) await fetchPokemonSets()
        return pokemonSets[id]
    }

    return (
        <PokemonCardsContext.Provider
            value={{
                getCardInformation,
                getCardsBySetId,
                getCardsByPokedex,
                getCardsByName,
                getSetInformation,
                masterSetCount,
                grandmasterSetCount,
                pokemonMasterSetCount,
                pokemonGrandmasterSetCount,
                getAllCards,
                getSetName,
                getSetInfo
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
