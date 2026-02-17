// Capacitor
import { CapacitorHttp } from '@capacitor/core';

// Utils
import { baseUrl } from '@/utils/constants';
import { MAXPOKEDEXVALUE } from '@/utils/pokedex';

export type Entry = {
  cardId: string;
  variant: string;
  condition: string;
  setId: string;
  forTrade: boolean;
  showcase: boolean;
  grade: string;
  gradeLevel: string;
  tags: string[];
  dexId: number[];
};

export type PokemonSet = {
  name: string;
  series: string;
  logo: string;
  symbol: string;
  official: number;
  total: number;
};

const pokemonCards: Record<string, Entry> = {};
const masterSetCards: Record<string, string[]> = {};
const grandmasterSetCards: Record<string, Record<string, string>> = {};
const pokemonMasterSetCards: Record<number, string[]> = {};
const pokemonGrandmasterSet: Record<number, Record<string, string>> = {};

// Track whether we've already fetched cards
let pokemonCardsInit: Promise<void> | null = null;

const fetchPokemonCards = async (userId: string): Promise<void> => {
  // If already initialized, just return the existing promise
  if (pokemonCardsInit) return pokemonCardsInit;

  pokemonCardsInit = (async () => {
    try {
      const res = await CapacitorHttp.post({
        url: `${baseUrl}/api/user-cards`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          userId: userId,
        },
      });

      if (res.status !== 200)
        throw new Error(`Failed to fetch /api/user-cards for user ${userId}`);

      const collectionEntries = res.data.cards;

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
          tags: collectionEntry.tags,
        };

        // Add to master and grandmaster sets
        const setId = collectionEntry.card?.setId;

        if (setId) {
          if (!masterSetCards[setId]) masterSetCards[setId] = [];
          masterSetCards[setId].push(collectionEntry.cardId);

          if (!grandmasterSetCards[setId]) grandmasterSetCards[setId] = {};
          grandmasterSetCards[setId][collectionEntry.cardId] =
            collectionEntry.variant;
        }

        // Add cards to the Pokemon master and grandmaster sets
        // Sorted by dexId
        const dexIds = collectionEntry.card?.dexId || [];

        for (const dexId of dexIds) {
          if (dexId > MAXPOKEDEXVALUE) continue;

          if (!pokemonMasterSetCards[dexId]) pokemonMasterSetCards[dexId] = [];
          pokemonMasterSetCards[dexId].push(collectionEntry.cardId);

          if (!pokemonGrandmasterSet[dexId]) pokemonGrandmasterSet[dexId] = {};
          pokemonGrandmasterSet[dexId][collectionEntry.cardId] =
            collectionEntry.variant;
        }
      }
    } catch (err) {
      console.error('Fetch error for pokemon cards:', err);
    }
  })();

  return pokemonCardsInit;
};

/**
 * Returns Pokemon cards that belongs to a specific set
 * @param setId
 * @returns
 */
export const getUserCardsBySetId = async (
  userId: string,
  setId: string
): Promise<Entry[]> => {
  if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards(userId);
  return Object.values(pokemonCards).filter((card) => card.setId === setId);
};

/**
 * Retrieves Pokemon cards with the Pokemon name
 * @param name
 * @returns
 */
export const getUserCardsByPokemonId = async (
  userId: string,
  pId: number
): Promise<Entry[]> => {
  if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards(userId);
  return Object.values(pokemonCards).filter((card) => card.dexId.includes(pId));
};

/**
 * Gets the total cards for the master set
 * @param setId
 * @returns
 */
export const userMasterSetCount = async (
  userId: string,
  setId: string
): Promise<number> => {
  if (Object.keys(masterSetCards).length === 0) await fetchPokemonCards(userId);

  return masterSetCards[setId]?.length ?? 0;
};

/**
 * Calculates the grandmaster set count based on the variants of cards in the set
 * @param setId
 * @returns
 */
export const userGrandmasterSetCount = async (
  userId: string,
  setId: string
): Promise<number> => {
  if (Object.keys(grandmasterSetCards).length === 0)
    await fetchPokemonCards(userId);

  let count = 0;
  for (const [, variants] of Object.entries(grandmasterSetCards[setId] || {})) {
    count += variants.length;
  }
  return count ?? 0;
};

export const userPokemonMasterSetCount = async (
  userId: string,
  pokedexId: number
): Promise<number> => {
  if (Object.keys(pokemonMasterSetCards).length === 0)
    await fetchPokemonCards(userId);

  return pokemonMasterSetCards[pokedexId]?.length ?? 0;
};

export const userPokemonGrandmasterSetCount = async (
  userId: string,
  pokedexId: number
): Promise<number> => {
  if (Object.keys(pokemonGrandmasterSet).length === 0)
    await fetchPokemonCards(userId);
  let count = 0;

  for (const [, variants] of Object.entries(
    pokemonGrandmasterSet[pokedexId] || {}
  )) {
    count += Object.keys(variants).length;
  }
  return count ?? 0;
};
