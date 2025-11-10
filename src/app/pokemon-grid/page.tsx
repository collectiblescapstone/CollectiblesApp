'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Portal,
  Select,
  createListCollection,
} from '@chakra-ui/react';
import PokemonPolaroid from '@/components/pokemonPolaroid/PokemonPolaroid';
import PokemonSet from '@/components/pokemonSet/PokemonSet';

export default function PokemonGridPage() {
  const [selected, setSelected] = useState('set');
  const [selectedEra, setSelectedEra] = useState('');
  const [groupedSets, setGroupedSets] = useState<Record<string, any[]>>({});

  const TOTAL_POKEMON = 1025;
  const pokemon = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);

  const frameworks = createListCollection({
    items: [
      { label: 'Set', value: 'set' },
      { label: 'Pokémon', value: 'pokemon' },
    ],
  });

  const setEras = [
    { label: 'Scarlet & Violet', value: 'sv' },
    { label: 'Sword & Shield', value: 'swsh' },
    { label: 'Sun & Moon', value: 'sm' },
    { label: 'X & Y', value: 'xy' },
    { label: 'Black & White', value: 'bw' },
    { label: 'Diamond & Pearl', value: 'dp' },
    { label: 'Mega Evolution', value: 'me' },
    { label: 'Other', value: 'other' },
  ];

  const eraOptions = createListCollection({
    items: setEras.map((era) => ({
      label: era.label,
      value: era.value,
    })),
  });

  // 🧩 Fetch and group JSON once on mount
  useEffect(() => {
    fetch('/temporary_card_data/sets.json')
      .then((res) => res.json())
      .then((data) => {
        const sets = Array.isArray(data) ? data : [data];

        const groups: Record<string, any[]> = {
          sv: [],
          swsh: [],
          sm: [],
          xy: [],
          bw: [],
          dp: [],
          me: [],
          other: [],
        };

        sets.forEach((set) => {
          const id = set.id?.toLowerCase() ?? '';
          if (id.includes('sv')) groups.sv.push(set);
          else if (id.includes('swsh')) groups.swsh.push(set);
          else if (id.includes('sm')) groups.sm.push(set);
          else if (id.includes('xy')) groups.xy.push(set);
          else if (id.includes('bw')) groups.bw.push(set);
          else if (id.includes('dp')) groups.dp.push(set);
          else if (id.includes('me')) groups.me.push(set);
          else groups.other.push(set);
        });

        setGroupedSets(groups);
      })
      .catch((err) => console.error('Error loading sets.json:', err));
  }, []);

  return (
    <div>
      {/* Sort dropdown */}
      <Select.Root
        collection={frameworks}
        size="sm"
        width="300px"
        defaultValue={['set']}
        onValueChange={(e) => {
          setSelected(e.value[0]);
          setSelectedEra('');
        }}
      >
        <Select.HiddenSelect />
        <Select.Label>Sort By</Select.Label>
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select sort" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {frameworks.items.map((framework) => (
                <Select.Item item={framework} key={framework.value}>
                  {framework.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      {/* Pokémon Grid View */}
      {selected === 'pokemon' && (
        <Box bg="gray.100" minH="100vh" p="50px">
          <Grid
            templateColumns={{
              base: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(6, 1fr)',
            }}
            gap="2vw"
            justifyItems="center"
          >
            {pokemon.map((id) => (
              <GridItem key={id}>
                <PokemonPolaroid id={id} />
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}

      {/* Set Era View */}
      {selected === 'set' && (
        <Box bg="gray.100" minH="100vh" p="50px">
          <Select.Root
            collection={eraOptions}
            size="sm"
            width="300px"
            placeholder="Select an Era"
            onValueChange={(e) => setSelectedEra(e.value[0])}
          >
            <Select.HiddenSelect />
            <Select.Label>Set Era</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Era" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {eraOptions.items.map((era) => (
                    <Select.Item item={era} key={era.value}>
                      {era.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          {/* Display sets (using your PokemonSet component) */}
          {selectedEra && groupedSets[selectedEra] && (
            <Grid
              mt="30px"
              templateColumns={{
                base: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)',
              }}
              gap="20px"
            >
              {groupedSets[selectedEra].map((set) => {
                const imageSrc =
                  set.logo || set.symbol || '/placeholder-set-image.png';
                const description = `ID: ${set.id} • Cards: ${
                  set.cardCount?.official ?? 'N/A'
                }`;

                return (
                  <GridItem key={set.id}>
                    <PokemonSet
                      label={set.name}
                      image={imageSrc + '.png'}
                      description={description}
                    />
                  </GridItem>
                );
              })}
            </Grid>
          )}
        </Box>
      )}
    </div>
  );
}
