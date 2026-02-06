import type { Card } from '@prisma/client';

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

const pokemonCards: Record<string, PokemonCard> = {};
const fetchPokemonCards = async () => {
  try {
    const response = await fetch('/api/pokemon-card');
    if (!response.ok) throw new Error(`Failed to fetch /api/pokemon-card`);
    const cards: Card[] = await response.json();

    for (const pokemonCard of cards) {
      pokemonCards[pokemonCard.id.toString()] = {
        name: pokemonCard.name,
        category: pokemonCard.category,
        types: pokemonCard.types,
        illustrator: pokemonCard.illustrator || '',
        rarity: pokemonCard.rarity,
        variants: pokemonCard.variants,
        dexId: pokemonCard.dexId,
        image_url: pokemonCard.image_url,
        setId: pokemonCard.setId,
      };
    }
  } catch (err) {
    console.error('Fetch error for pokemon cards:', err);
  }
};

export const getCardInformation = async (
  id: string
): Promise<PokemonCard | undefined> => {
  if (Object.keys(pokemonCards).length === 0) {
    await fetchPokemonCards();
  }
  return pokemonCards[id];
};
