'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Grid, Flex, Heading, Spinner, Text } from '@chakra-ui/react';

// Child Components
import PokemonCardMini from '@/components/pokemon-cards/pokemon-card-mini/PokemonCardMini';
import CardFilter from '@/components/card-filter/CardFilter';

// Hooks
import { FiltersProvider, useFilters } from '@/hooks/useFilters';

// Utils
import { getPokemonName, getGeneration } from '@/utils/pokedex';

// Types
import type { CardData } from '@/types/pokemon-card';

export default function FilterCardsPage() {
  // Page-level provider wraps the content
  return (
    <FiltersProvider>
      <FilterCardsContent />
    </FiltersProvider>
  );
}

function FilterCardsContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const setId = searchParams.get('setId');
  const pId = searchParams.get('pId');
  const setName = searchParams.get('setName');

  const { filters } = useFilters();
  const [pokemonName, setPokemonName] = useState<string | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cards based on type & params
  useEffect(() => {
    const loadData = async () => {
      if (!type) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let url = '';
        if (type === 'set') {
          url = `/api/pokemon-card?type=set&setId=${setId}`;
        } else if (type === 'pokemon') {
          url = `/api/pokemon-card?type=pokemon&pId=${pId}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);

        const data = await response.json();

        // Clean up the id (remove prefix before hyphen)
        data.forEach((card: CardData) => {
          const idParts = card.id.split('-');
          card.id = idParts[idParts.length - 1];
        });

        // Sort by numeric id
        data.sort((a: CardData, b: CardData) => Number(a.id) - Number(b.id));

        setCards(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading data:', error);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [type, setId, pId]);

  // Fetch Pokémon name if viewing a single Pokémon
  useEffect(() => {
    if (type === 'pokemon' && pId) {
      getPokemonName(Number(pId)).then(setPokemonName);
    } else {
      setPokemonName(null);
    }
  }, [type, pId]);

  // Filter cards based on FiltersContext
  const filteredCards = cards.filter((card) => {
    // CATEGORY
    if (
      !filters.categories.includes(card.category) &&
      !(card.category === 'Pokemon' && filters.categories.includes('Pokémon'))
    )
      return false;

    // TYPE
    if (card.types?.length) {
      const hasEnabledType = card.types.some((type) => filters.types[type]);
      if (!hasEnabledType) return false;
    }

    // GENERATION
    if (card.dexId?.length) {
      const matchesGeneration = card.dexId.some((dexNumber) => {
        const generation = getGeneration(dexNumber);
        return filters.generations.includes(generation);
      });
      if (!matchesGeneration) return false;
    }

    return true;
  });

  console.log(filteredCards);

  if (loading)
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );

  return (
    <Box p={6}>
      <Flex mb={6} justify="space-between" align="center">
        <Heading>
          {type === 'set'
            ? `${setName} Card Set`
            : `${type === 'set' ? setName : pokemonName} Cards`}
        </Heading>
        <CardFilter />
      </Flex>

      {filteredCards.length === 0 ? (
        <Text>No cards match the selected filters.</Text>
      ) : (
        <Grid
          templateColumns={{
            base: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(6, 1fr)',
          }}
          gap="2vw"
          justifyItems="center"
          mt={4}
        >
          {filteredCards.map((card, index) => (
            <PokemonCardMini
              key={index}
              cardName={card.name}
              cardId={
                card.id +
                (Number(card.set.official) > 0 ? '/' + card.set.official : '')
              }
              image={card.image_url}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
}
