import { CapacitorHttp } from '@capacitor/core';
import { baseUrl } from '@/utils/constants';
import type { CardData } from '@/types/pokemon-card';

export interface GetPokemonCardsFilters {
  ids: string[];
}

export const getPokemonCards = async (
  filters?: GetPokemonCardsFilters
): Promise<CardData[]> => {
  const response = await CapacitorHttp.post({
    url: `${baseUrl}/api/pokemon-card`,
    data: filters ?? {},
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error('Failed to fetch /api/pokemon-card');
  }

  return await response.data;
};
