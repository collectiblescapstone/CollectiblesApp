'use client'

import { createContext, useContext, ReactNode } from 'react'
import { CapacitorHttp } from '@capacitor/core'

// Types
import type { Set } from '@prisma/client'
import type { CardData } from '@/types/pokemon-card'
import type { PokemonCard, PokemonSet } from '@/types/Cards/frontend-card'

// Utils
import { baseUrl } from '@/utils/constants'
import { MAXPOKEDEXVALUE } from '@/utils/pokedex'

/* ---------------- GLOBAL CACHE ---------------- */

const pokemonCards: Record<string, PokemonCard> = {}
const pokemonSets: Record<string, PokemonSet> = {}

let grandmasterSetCounts: Record<string, number> = {}
let pokemonMasterCounts: number[] = []
let pokemonGrandmasterCounts: number[] = []

let pokemonCardsInit: Promise<void> | null = null
let pokemonSetsInit: Promise<void> | null = null

/* ---------------- API ---------------- */

export interface GetPokemonCardsFilters {
    ids: string[]
}

export const getPokemonCards = async (
    filters?: GetPokemonCardsFilters
): Promise<CardData[]> => {
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

    return await response.data
}

/* ---------------- FETCHERS ---------------- */

const fetchPokemonCards = async (): Promise<void> => {
    // If already initialized, just return the existing promise
    if (pokemonCardsInit) return pokemonCardsInit

    pokemonCardsInit = (async () => {
        try {
            const cards = await getPokemonCards()

            // Clear counts first
            pokemonMasterCounts = []
            pokemonGrandmasterCounts = []
            grandmasterSetCounts = {}

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

                if (!grandmasterSetCounts[setId]) {
                    grandmasterSetCounts[setId] = 0
                }

                // Add the variant count, defaulting to 1 if empty
                const variantCount = pokemonCard.variants?.length ?? 0
                grandmasterSetCounts[setId] +=
                    variantCount > 0 ? Number(variantCount) : 1
            }

            // Iterate through all the pokemon in the pokedex
            // Required to do this since the names are different (Rowlet & Alolan Exeggutor GX)
            // I might add substring parsing to make this faster in the future, but not now

            for (let i = 0; i < MAXPOKEDEXVALUE; i++) {
                const pokedexValue = i + 1

                if (!pokemonMasterCounts[i]) pokemonMasterCounts.push(0)
                if (!pokemonGrandmasterCounts[i])
                    pokemonGrandmasterCounts.push(0)

                for (const [, cardInfo] of Object.entries(pokemonCards)) {
                    if (cardInfo.dexId.includes(pokedexValue)) {
                        // Add the values to the arrays
                        if (!pokemonGrandmasterCounts[i]) {
                            pokemonGrandmasterCounts[i] = 0
                        }

                        // Add the variant count, defaulting to 1 if empty
                        const variantCount = cardInfo.variants?.length ?? 0
                        pokemonGrandmasterCounts[i] +=
                            variantCount > 0 ? Number(variantCount) : 1

                        if (!pokemonMasterCounts[i]) {
                            pokemonMasterCounts[i] = 0
                        }

                        // Add the variant count, defaulting to 1 if empty

                        pokemonMasterCounts[i] += 1
                    }
                }
            }
        } catch (err) {
            console.error('Fetch error for pokemon cards:', err)
        }
    })()
    return pokemonCardsInit
}

const fetchPokemonSets = async (): Promise<void> => {
    if (pokemonSetsInit) return pokemonSetsInit

    pokemonSetsInit = (async () => {
        try {
            const response = await fetch('/api/pokemon-set')
            if (!response.ok)
                throw new Error(`Failed to fetch /api/pokemon-set`)
            const sets: Set[] = await response.json()

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
    })()

    return pokemonSetsInit
}

/* ---------------- CONTEXT ---------------- */

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
}

const PokemonCardsContext = createContext<PokemonCardsContextType | undefined>(
    undefined
)

/* ---------------- PROVIDER ---------------- */

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
        // console.log('getCardInformation: ', pokemonCards[id].name)
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
    const getCardsByName = async (name: string): Promise<Record<string, PokemonCard>> => {
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
    const getCardsByPokedex = async (pId: number): Promise<Record<string, PokemonCard>> => {
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
     * Gets the total cards for the master set
     * @param setId
     * @returns
     */
    const masterSetCount = async (
        setId: string
    ): Promise<number | undefined> => {
        const setInfo = await getSetInformation(setId)
        return setInfo?.total
    }

    /**
     * Calculates the grandmaster set count based on the variants of cards in the set
     * @param setId
     * @returns
     */
    const grandmasterSetCount = async (setId: string): Promise<number> => {
        if (Object.keys(grandmasterSetCounts).length === 0)
            await fetchPokemonCards()
        return grandmasterSetCounts[setId] ?? 0
    }

    const pokemonMasterSetCount = async (
        pokedexId: number
    ): Promise<number> => {
        if (pokemonMasterCounts.length === 0) await fetchPokemonCards()
        return pokemonMasterCounts[pokedexId - 1] ?? 0
    }

    const pokemonGrandmasterSetCount = async (
        pokedexId: number
    ): Promise<number> => {
        if (pokemonGrandmasterCounts.length === 0) await fetchPokemonCards()
        return pokemonGrandmasterCounts[pokedexId - 1] ?? 0
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
                pokemonGrandmasterSetCount
            }}
        >
            {children}
        </PokemonCardsContext.Provider>
    )
}

/* ---------------- HOOK ---------------- */

export const usePokemonCards = () => {
    const context = useContext(PokemonCardsContext)

    if (!context) {
        throw new Error(
            'usePokemonCards must be used within a PokemonCardsProvider'
        )
    }

    return context
}