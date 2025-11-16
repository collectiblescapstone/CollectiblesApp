'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import PokemonCardMini from '@/components/pokemonCardMini/PokemonCardMini';
import { PokemonCard } from '@/types/pokemon-card';

export default function FilterCardsPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const name = searchParams.get('name');

  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainSet, setMainSet] = useState(0);

  useEffect(() => {
    if (!type || !name) return;

    const loadData = async () => {
      setLoading(true);
      try {
        if (type === 'set') {
          const url = `/temporary_card_data/cards_${name}.json`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${url}`);
          const data = await response.json();

          if (data.cardCount) setMainSet(data.cardCount.official);
          if (data.cards && Array.isArray(data.cards)) setCards(data.cards);
          else setCards([]);
        } else if (type === 'pokemon') {
          const fakeData: PokemonCard[] = Array.from({ length: 5 }, (_, i) => ({
            category: 'Pokemon',
            id: `fake-${i + 1}`,
            illustrator: 'Unknown',
            image:
              'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
            localId: `${i + 1}`,
            name: `${name} Variant ${i + 1}`,
            rarity: 'Special',
            set: {
              cardCount: { official: 0, total: 0 },
              id: 'fake',
              name: 'Fake Set',
            },
            variants: {
              firstEdition: false,
              holo: false,
              normal: true,
              reverse: true,
              wPromo: false,
            },
            variants_detailed: [{ type: 'normal', size: 'standard' }],
            dexId: [],
            hp: 0,
            types: [],
            stage: 'Basic',
            attacks: [],
            retreat: 0,
            regulationMark: '',
            legal: { standard: true, expanded: true },
            updated: new Date().toISOString(),
            pricing: {
              cardmarket: {
                updated: '',
                unit: '',
                avg: 0,
                low: 0,
                trend: 0,
                avg1: 0,
                avg7: 0,
                avg30: 0,
                'avg-holo': 0,
                'low-holo': 0,
                'trend-holo': 0,
                'avg1-holo': 0,
                'avg7-holo': 0,
                'avg30-holo': 0,
              },
              tcgplayer: null,
            },
          }));
          setCards(fakeData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [type, name]);

  if (loading)
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );

  return (
    <Box p={6}>
      <Heading mb={6}>
        {type === 'set' ? `${name} Card Set` : `${name} Cards`}
      </Heading>

      {cards.length === 0 ? (
        <Text>No cards found.</Text>
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
          {cards.map((card, index) => (
            <PokemonCardMini
              key={index}
              cardName={card.name}
              cardId={card.localId + '/' + mainSet}
              image={card.image}
              // rarity={card.rarity}
              // illustrator={card.illustrator}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
}
