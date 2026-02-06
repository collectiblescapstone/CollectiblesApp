import type { Set } from '@prisma/client';

export type PokemonSet = {
  name: string;
  series: string;
  logo: string;
  symbol: string;
  official: number;
  total: number;
};

const pokemonSets: Record<string, PokemonSet> = {};
const fetchPokemonSets = async () => {
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
};

export const getSetInformation = async (
  id: string
): Promise<PokemonSet | undefined> => {
  if (Object.keys(pokemonSets).length === 0) {
    await fetchPokemonSets();
  }
  return pokemonSets[id];
};
