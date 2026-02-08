// Types
import type { Card, Set } from '@prisma/client';

// Utils
import { getPokemonName, MAXPOKEDEXVALUE } from '@/utils/pokedex';

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
let pokemonMasterCounts: Record<string, number> = {};
let pokemonGrandmasterCounts: Record<string, number> = {};

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
      pokemonMasterCounts = {};
      pokemonGrandmasterCounts = {};
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

        if (!pokemonGrandmasterCounts[setId]) {
          pokemonGrandmasterCounts[setId] = 0;
        }

        // Add the variant count, defaulting to 1 if empty
        const variantCount = pokemonCard.variants?.length ?? 0;
        pokemonGrandmasterCounts[setId] +=
          variantCount > 0 ? Number(variantCount) : 1;
      }

      // Iterate through all the pokemon in the pokedex
      // Required to do this since the names are different (Rowlet & Alolan Exeggutor GX)
      // I might add substring parsing to make this faster in the future, but not now

      for (let i = 0; i < MAXPOKEDEXVALUE; i++) {
        const pokemonName = await getPokemonName(i + 1);
        if (!pokemonMasterCounts[pokemonName])
          pokemonMasterCounts[pokemonName] = 0;
        if (!pokemonGrandmasterCounts[pokemonName])
          pokemonGrandmasterCounts[pokemonName] = 0;

        for (const pId in Object.values(pokemonCards)) {
          if (pokemonCards[pId].name.includes(pokemonName)) {
            // Add the values to the arrays
            pokemonGrandmasterCounts = editSetCounts(
              pokemonGrandmasterCounts,
              pokemonName,
              pokemonCards[pId].variants?.length ?? 0
            );
            pokemonMasterCounts = editSetCounts(
              pokemonMasterCounts,
              pokemonName,
              1
            );
          }
        }
      }
    } catch (err) {
      console.error('Fetch error for pokemon cards:', err);
    }
  })();
  return pokemonCardsInit;
};

/**
 * Edits the set counts
 * @param set
 * @param index
 * @param value
 * @returns
 */
const editSetCounts = (
  set: Record<string, number>,
  index: string,
  value: number
) => {
  if (!set[index]) set[index] = 0;
  set[index] += value > 0 ? value : 1;
  return set;
};

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
  if (Object.keys(pokemonGrandmasterCounts).length === 0)
    await fetchPokemonCards();
  return pokemonGrandmasterCounts[setId] ?? 0;
};

export const pokemonMasterSetCount = async (
  pokemonName: string
): Promise<number> => {
  if (Object.keys(pokemonMasterCounts).length === 0) await fetchPokemonCards();
  return pokemonMasterCounts[pokemonName] ?? 0;
};

export const pokemonGrandmasterSetCount = async (
  pokemonName: string
): Promise<number> => {
  if (Object.keys(pokemonGrandmasterCounts).length === 0)
    await fetchPokemonCards();
  return pokemonGrandmasterCounts[pokemonName] ?? 0;
};
