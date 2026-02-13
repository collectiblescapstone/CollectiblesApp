// Types
import type { Card, Set } from '@prisma/client';

// Utils
import { MAXPOKEDEXVALUE } from '@/utils/pokedex';

export type PokemonCard = {
  name: string;
  category: string;
  types: string[];
  illustrator: string;
  rarity: string;
  variants: string[];
  dexId: number[];
  image_url: string;
  setId: string;
};

export type PokemonSet = {
  name: string;
  series: string;
  logo: string;
  symbol: string;
  official: number;
  total: number;
};

const pokemonCards: Record<string, PokemonCard> = {};
const pokemonSets: Record<string, PokemonSet> = {};
let grandmasterSetCounts: Record<string, number> = {};
let pokemonMasterCounts: number[] = [];
let pokemonGrandmasterCounts: number[] = [];

// Track whether we've already fetched cards
let pokemonCardsInit: Promise<void> | null = null;
let pokemonSetsInit: Promise<void> | null = null;

const fetchPokemonCards = async (): Promise<void> => {
  // If already initialized, just return the existing promise
  if (pokemonCardsInit) return pokemonCardsInit;

  pokemonCardsInit = (async () => {
    try {
      const response = await fetch('/api/pokemon-card');
      if (!response.ok) throw new Error(`Failed to fetch /api/pokemon-card`);
      const cards: Card[] = await response.json();

      // Clear counts first
      pokemonMasterCounts = [];
      pokemonGrandmasterCounts = [];
      grandmasterSetCounts = {};

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
          setId: pokemonCard.setId,
        };

        const setId = pokemonCard.setId;

        if (!grandmasterSetCounts[setId]) {
          grandmasterSetCounts[setId] = 0;
        }

        // Add the variant count, defaulting to 1 if empty
        const variantCount = pokemonCard.variants?.length ?? 0;
        grandmasterSetCounts[setId] +=
          variantCount > 0 ? Number(variantCount) : 1;
      }

      // Iterate through all the pokemon in the pokedex
      // Required to do this since the names are different (Rowlet & Alolan Exeggutor GX)
      // I might add substring parsing to make this faster in the future, but not now

      for (let i = 0; i < MAXPOKEDEXVALUE; i++) {
        const pokedexValue = i + 1;

        if (!pokemonMasterCounts[i]) pokemonMasterCounts.push(0);
        if (!pokemonGrandmasterCounts[i]) pokemonGrandmasterCounts.push(0);

        for (const [, cardInfo] of Object.entries(pokemonCards)) {
          // console.log(pokemonCards[pId], cardInfo);
          if (cardInfo.dexId.includes(pokedexValue)) {
            // Add the values to the arrays
            if (!pokemonGrandmasterCounts[i]) {
              pokemonGrandmasterCounts[i] = 0;
            }

            // Add the variant count, defaulting to 1 if empty
            const variantCount = cardInfo.variants?.length ?? 0;
            pokemonGrandmasterCounts[i] +=
              variantCount > 0 ? Number(variantCount) : 1;

            if (!pokemonMasterCounts[i]) {
              pokemonMasterCounts[i] = 0;
            }

            // Add the variant count, defaulting to 1 if empty

            pokemonMasterCounts[i] += 1;
          }
        }
      }
    } catch (err) {
      console.error('Fetch error for pokemon cards:', err);
    }
  })();
  return pokemonCardsInit;
};

// /**
//  * Edits the set counts
//  * @param set
//  * @param index
//  * @param value
//  * @returns
//  */
// const editSetCounts = (
//   set: Record<string, number>,
//   index: string,
//   value: number
// ) => {
//   if (!set[index]) set[index] = 0;
//   set[index] += value > 0 ? value : 1;
//   return set;
// };

const fetchPokemonSets = async (): Promise<void> => {
  if (pokemonSetsInit) return pokemonSetsInit;

  pokemonSetsInit = (async () => {
    try {
      const response = await fetch('/api/pokemon-set');
      if (!response.ok) throw new Error(`Failed to fetch /api/pokemon-set`);
      const sets: Set[] = await response.json();

      for (const pokemonSet of sets) {
        pokemonSets[pokemonSet.id.toString()] = {
          name: pokemonSet.name,
          series: pokemonSet.series,
          logo: pokemonSet.logo || '',
          symbol: pokemonSet.symbol || '',
          official: pokemonSet.official,
          total: pokemonSet.total,
        };
      }
    } catch (err) {
      console.error('Fetch error for pokemon sets:', err);
    }
  })();

  return pokemonSetsInit;
};

/**
 * Retrieves a Pokemon card from the cache or fetches it if not available
 * @param id
 * @returns
 */
export const getCardInformation = async (
  id: string
): Promise<PokemonCard | undefined> => {
  if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards();
  return pokemonCards[id];
};

/**
 * Returns Pokemon cards that belongs to a specific set
 * @param setId
 * @returns
 */
export const getCardsBySetId = async (
  setId: string
): Promise<PokemonCard[]> => {
  if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards();
  return Object.values(pokemonCards).filter((card) => card.setId === setId);
};

/**
 * Retrieves Pokemon cards with the Pokemon name
 * @param name
 * @returns
 */
export const getCardsByName = async (name: string): Promise<PokemonCard[]> => {
  if (Object.keys(pokemonCards).length === 0) await fetchPokemonCards();
  return Object.values(pokemonCards).filter((card) => card.name.includes(name));
};

/**
 * Retrieves the set information for Pokemon
 * @param id
 * @returns
 */
export const getSetInformation = async (
  id: string
): Promise<PokemonSet | undefined> => {
  if (Object.keys(pokemonSets).length === 0) await fetchPokemonSets();
  return pokemonSets[id];
};

/**
 * Gets the total cards for the master set
 * @param setId
 * @returns
 */
export const masterSetCount = async (
  setId: string
): Promise<number | undefined> => {
  const setInfo = await getSetInformation(setId);
  return setInfo?.total;
};

/**
 * Calculates the grandmaster set count based on the variants of cards in the set
 * @param setId
 * @returns
 */
export const grandmasterSetCount = async (setId: string): Promise<number> => {
  if (Object.keys(grandmasterSetCount).length === 0) await fetchPokemonCards();
  return grandmasterSetCounts[setId] ?? 0;
};

export const pokemonMasterSetCount = async (
  pokedexId: number
): Promise<number> => {
  if (pokemonMasterCounts.length === 0) await fetchPokemonCards();
  return pokemonMasterCounts[pokedexId - 1] ?? 0;
};

export const pokemonGrandmasterSetCount = async (
  pokedexId: number
): Promise<number> => {
  if (pokemonGrandmasterCounts.length === 0) await fetchPokemonCards();
  return pokemonGrandmasterCounts[pokedexId - 1] ?? 0;
};
