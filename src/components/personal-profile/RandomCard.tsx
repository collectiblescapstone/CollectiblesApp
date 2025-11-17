'use client';

import React from 'react';

import { useState } from 'react';
import { PokemonCard, PokemonCardImage } from '@/types/personal-profile';

export const useRandomCards = (filename: string, count: number) => {
  const [cards, setCards] = useState<PokemonCardImage[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchCards = async () => {
      const url = `/temporary_card_data/cards_${filename}.json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      const data: PokemonCard = await response.json();

      // Randomly select 4 cards to display
      const randomPokemonCards = [...data.cards]
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
      setCards(randomPokemonCards);
      setLoading(false);
    };

    fetchCards();
  }, [filename, count]);

  return { cards, loading };
};
