// Capacitor
import { CapacitorHttp } from '@capacitor/core'

// Utils
import { baseUrl } from '@/utils/constants'
import { MAXPOKEDEXVALUE } from '@/utils/pokedex'

export type Entry = {
    cardId: string
    variant: string
    condition: string
    setId: string
    forTrade: boolean
    showcase: boolean
    grade: string
    gradeLevel: string
    tags: string[]
    dexId: number[]
}

export type PokemonSet = {
    name: string
    series: string
    logo: string
    symbol: string
    official: number
    total: number
}

let pokemonCards: Record<string, Entry> = {}

// Set counts based on set
const masterSetCards: Record<string, Set<string>> = {}
const grandmasterSetCards: Record<string, Record<string, Set<string>>> = {}

// Set counts based on Pokedex ID
const pokemonMasterSetCards: Record<number, Set<string>> = {}
const pokemonGrandmasterSet: Record<number, Record<string, Set<string>>> = {}

// Track whether we've already fetched cards
let pokemonCardsInit: Promise<void> | null = null

const fetchPokemonCards = async (userId: string): Promise<void> => {
    // If already initialized, just return the existing promise
    if (pokemonCardsInit) return pokemonCardsInit

    pokemonCardsInit = (async () => {
        try {
            const res = await CapacitorHttp.post({
                url: `${baseUrl}/api/user-cards`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: {
                    userId: userId
                }
            })

            if (res.status !== 200)
                throw new Error(
                    `Failed to fetch /api/user-cards for user ${userId}`
                )

            const collectionEntries = res.data.cards

            for (const collectionEntry of collectionEntries) {
                // Populate a list of cards owned
                pokemonCards[collectionEntry.id.toString()] = {
                    cardId: collectionEntry.cardId,
                    variant: collectionEntry.variant,
                    condition: collectionEntry.condition || '',
                    setId: collectionEntry.card?.setId ?? [],
                    dexId: collectionEntry.card?.dexId ?? [],
                    forTrade: collectionEntry.forTrade,
                    showcase: collectionEntry.showcase,
                    grade: collectionEntry.grade,
                    gradeLevel: collectionEntry.gradeLevel,
                    tags: collectionEntry.tags
                }

                // Add to master and grandmaster sets
                const setId = collectionEntry.card?.setId

                if (setId) {
                    if (!masterSetCards[setId])
                        masterSetCards[setId] = new Set<string>()
                    masterSetCards[setId].add(collectionEntry.cardId)

                    if (!grandmasterSetCards[setId])
                        grandmasterSetCards[setId] = {}
                    if (!grandmasterSetCards[setId][collectionEntry.cardId])
                        grandmasterSetCards[setId][collectionEntry.cardId] =
                            new Set<string>()
                    grandmasterSetCards[setId][collectionEntry.cardId].add(
                        collectionEntry.variant
                    )
                }

                // Add cards to the Pokemon master and grandmaster sets
                // Sorted by dexId
                const dexIds = collectionEntry.card?.dexId || []

                for (const dexId of dexIds) {
                    if (dexId > MAXPOKEDEXVALUE) continue

                    if (!pokemonMasterSetCards[dexId])
                        pokemonMasterSetCards[dexId] = new Set<string>()
                    pokemonMasterSetCards[dexId].add(collectionEntry.cardId)

                    if (!pokemonGrandmasterSet[dexId])
                        pokemonGrandmasterSet[dexId] = {}
                    if (!pokemonGrandmasterSet[dexId][collectionEntry.cardId]) {
                        pokemonGrandmasterSet[dexId][collectionEntry.cardId] =
                            new Set<string>()
                    }
                    pokemonGrandmasterSet[dexId][collectionEntry.cardId].add(
                        collectionEntry.variant
                    )
                }
            }
        } catch (err) {
            console.error('Fetch error for pokemon cards:', err)
        }
    })()

    return pokemonCardsInit
}

export const refreshPokemonCards = (userId: string): void => {
    pokemonCardsInit = null
    pokemonCards = {}
    fetchPokemonCards(userId)
}

/**
 * Returns Pokemon cards that belongs to a specific set
 * @param setId
 * @returns
 */
export const getUserCardsBySetId = async (
    userId: string,
    setId: string
): Promise<Entry[]> => {
    if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards(userId)
    return Object.values(pokemonCards).filter((card) => card.setId === setId)
}

/**
 * Retrieves Pokemon cards with the Pokemon name
 * @param name
 * @returns
 */
export const getUserCardsByPokemonId = async (
    userId: string,
    pId: number
): Promise<Entry[]> => {
    if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards(userId)
    return Object.values(pokemonCards).filter((card) =>
        card.dexId.includes(pId)
    )
}

/**
 * Get the master set cards for a user based on setId
 * @param userId
 * @param setId
 * @returns
 */
export const userMasterSet = async (
    userId: string,
    setId: string
): Promise<string[]> => {
    if (Object.keys(masterSetCards).length === 0)
        await fetchPokemonCards(userId)

    return Array.from(masterSetCards[setId] ?? new Set<string>())
}

/**
 * Gets the total cards for the master set based on setId
 * @param userId
 * @param setId
 * @returns
 */
export const userMasterSetCount = async (
    userId: string,
    setId: string
): Promise<number> => {
    return userMasterSet(userId, setId).then((cards) => cards.length)
}

/**
 * Calculates the grandmaster set count based on the setId
 * WILL NEED TO REFACTOR FOR THE SHOW ALL CARDS PAGE
 * @param userId
 * @param setId
 * @returns
 */
export const userGrandmasterSetCount = async (
    userId: string,
    setId: string
): Promise<number> => {
    if (Object.keys(grandmasterSetCards).length === 0)
        await fetchPokemonCards(userId)

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
export const userPokemonMasterSet = async (
    userId: string,
    pokedexId: number
): Promise<string[]> => {
    if (Object.keys(pokemonMasterSetCards).length === 0)
        await fetchPokemonCards(userId)

    return Array.from(pokemonMasterSetCards[pokedexId] || new Set<string>())
}

/**
 * Gets the total cards for the master set based on pokemonId
 * @param userId
 * @param pokemonId
 * @returns
 */
export const userPokemonMasterSetCount = async (
    userId: string,
    pokedexId: number
): Promise<number> => {
    return userPokemonMasterSet(userId, pokedexId).then((cards) => cards.length)
}

/**
 * Calculates the grandmaster set count based on the pokemonId
 * WILL NEED TO REFACTOR FOR THE SHOW ALL CARDS PAGE
 * @param userId
 * @param pokemonId
 * @returns
 */
export const userPokemonGrandmasterSetCount = async (
    userId: string,
    pokedexId: number
): Promise<number> => {
    if (Object.keys(pokemonGrandmasterSet).length === 0)
        await fetchPokemonCards(userId)

    const pokeData = pokemonGrandmasterSet[pokedexId]
    if (!pokeData) return 0

    let count = 0

    for (const cardId in pokeData) {
        count += pokeData[cardId].size
    }

    return count
}
