'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Flex,
  HStack,
  Heading,
  IconButton,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { LuChevronUp, LuChevronDown } from 'react-icons/lu';

// Child Components
import PokemonCardMini from '@/components/pokemon-cards/pokemon-card-mini/PokemonCardMini';
import CardFilter from '@/components/card-filter/CardFilter';

// Hooks
import { useFilters } from '@/hooks/useFilters';

// Utils
import { getPokemonName, getGeneration } from '@/utils/pokedex';

// Types
import type { CardData } from '@/types/pokemon-card';
import { useAuth } from '@/context/AuthProvider';

const FilterCardsContent: React.FC = () => {
  // Search Params
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const setId = searchParams.get('setId');
  const pId = searchParams.get('pId');
  const setName = searchParams.get('setName');

  // Filters from context
  const { filters } = useFilters();
  const { session, loading: authLoading } = useAuth();

  // Local States
  const [pokemonName, setPokemonName] = useState<string | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [ascending, setAscending] = useState(true);

  // Fetch cards based on type & params
  useEffect(() => {
    const loadData = async () => {
      if (!type) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/pokemon-card');
        if (!response.ok) throw new Error(`Failed to fetch /api/pokemon-card`);
        const cards: CardData[] = await response.json();

        const filteredCards = cards.filter((card) => {
          if (type === 'set') {
            return card.setId === setId;
          }

          if (type === 'pokemon') {
            return (
              Array.isArray(card.dexId) && card.dexId.includes(Number(pId))
            );
          }

          return true;
        });
        // Clean up the id (remove prefix before hyphen)
        filteredCards.forEach((card: CardData) => {
          const idParts = card.id.split('-');
          card.id = idParts[idParts.length - 1];
        });

        // Sort by numeric id
        filteredCards.sort(
          (a: CardData, b: CardData) => Number(a.id) - Number(b.id)
        );

        setCards(Array.isArray(filteredCards) ? filteredCards : []);
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

  // Reverse card order
  const toggleSortOrder = () => {
    setAscending((prev) => !prev);
    setCards((prevCards) => [...prevCards].reverse());
  };

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

  if (loading || authLoading || !session)
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );

  return (
    <Box>
      <Flex mb={6} justify="space-between" align="center" pl={5} pr={5} pt={5}>
        <Heading>
          {type === 'set'
            ? `${setName} Card Set`
            : `${type === 'set' ? setName : pokemonName} Cards`}
        </Heading>
        <Flex gap={1} align="right">
          <IconButton
            aria-label="Toggle sort order"
            size="lg"
            variant="ghost"
            onClick={toggleSortOrder}
          >
            {ascending ? <LuChevronUp /> : <LuChevronDown />}
          </IconButton>
          <CardFilter />
        </Flex>
      </Flex>

      {filteredCards.length === 0 ? (
        <Text>No cards match the selected filters.</Text>
      ) : (
        <HStack justify="center" gap={4} flexWrap="wrap" mb={4}>
          {filteredCards.map((card, index) => (
            <PokemonCardMini
              key={index}
              cardName={card.name}
              cardId={setId + "-" + card.id}
              setId={
                card.id +
                (Number(card.set.official) > 0 ? '/' + card.set.official : '')
              }
              image={card.image_url}
            />
          ))}
        </HStack>
      )}
    </Box>
  );
};

export default FilterCardsContent;
