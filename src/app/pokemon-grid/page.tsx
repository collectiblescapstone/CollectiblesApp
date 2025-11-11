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
import { PokemonSetType } from '@/types/pokemon-grid';

export default function PokemonGridPage() {
  const [selected, setSelected] = useState('set');
  const [selectedEra, setSelectedEra] = useState('sv');
  const [groupedSets, setGroupedSets] = useState<
    Record<string, PokemonSetType[]>
  >({});
  const [selectedGen, setSelectedGen] = useState('ALL');

  const TOTAL_POKEMON = 1025;
  const pokemon = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);

  const frameworks = createListCollection({
    items: [
      { label: 'Set', value: 'set' },
      { label: 'Pokémon', value: 'pokemon' },
    ],
  });

  // Final Pokédex numbers for each generation
  const pokemonGen = [151, 251, 386, 493, 649, 721, 809, 905, 1025];

  // Generation options
  const genOptions = [
    { label: 'ALL', value: 'ALL' },
    ...pokemonGen.map((last, index) => ({
      label: `Gen ${index + 1}`,
      value: (index + 1).toString(),
    })),
  ];

  const setEras = [
    { label: 'Scarlet & Violet', value: 'sv' },
    { label: 'Sword & Shield', value: 'swsh' },
    { label: 'Sun & Moon', value: 'sm' },
    { label: 'X & Y', value: 'xy' },
    { label: 'Black & White', value: 'bw' },
    { label: 'Diamond & Pearl', value: 'dp' },
    { label: 'Mega Evolution', value: 'me' },
    { label: 'Base', value: 'base' },
    { label: 'Other', value: 'other' },
  ];

  const eraOptions = createListCollection({
    items: setEras.map((era) => ({
      label: era.label,
      value: era.value,
    })),
  });

  useEffect(() => {
    fetch('/temporary_card_data/sets.json')
      .then((res) => res.json())
      .then((data) => {
        const sets = Array.isArray(data) ? data : [data];

        const groups: Record<string, PokemonSetType[]> = {
          sv: [],
          swsh: [],
          sm: [],
          xy: [],
          bw: [],
          dp: [],
          me: [],
          base: [],
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
          else if (id.includes('base')) groups.base.push(set);
          else groups.other.push(set);
        });

        setGroupedSets(groups);
      })
      .catch((err) => console.error('Error loading sets.json:', err));
  }, []);

  const selectStyles = {
    bg: 'gray.50',
    color: 'gray.800',
    border: '1px solid',
    borderColor: 'gray.300',
    _hover: { bg: 'gray.100' },
    _focusWithin: { borderColor: 'blue.400', boxShadow: '0 0 0 1px #63b3ed' },
  };

  // Filter Pokémon based on selected generation
  const filteredPokemon =
    selectedGen === 'ALL'
      ? pokemon
      : pokemon.filter((id) => {
          const genIndex = parseInt(selectedGen) - 1;
          const startId = genIndex === 0 ? 1 : pokemonGen[genIndex - 1] + 1;
          const endId = pokemonGen[genIndex];
          return id >= startId && id <= endId;
        });

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
          setSelectedEra('sv');
        }}
      >
        <Select.HiddenSelect />
        <Select.Label>Sort By</Select.Label>
        <Select.Control {...selectStyles}>
          <Select.Trigger>
            <Select.ValueText placeholder="Select sort" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content
              bg="white"
              color="gray.800"
              border="1px solid"
              borderColor="gray.300"
            >
              {frameworks.items.map((framework) => (
                <Select.Item
                  item={framework}
                  key={framework.value}
                  _hover={{ bg: 'gray.100' }}
                  _selected={{ bg: 'blue.50', color: 'blue.700' }}
                >
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
        <Box
          bg="gray.100"
          minH="100vh"
          px={{ base: '10px', md: '50px' }}
          py="50px"
        >
          {/* Generation dropdown */}
          <Select.Root
            collection={createListCollection({ items: genOptions })}
            size="sm"
            width="200px"
            defaultValue={['ALL']}
            onValueChange={(val) => setSelectedGen(val.value[0])}
          >
            <Select.HiddenSelect />
            <Select.Label>Generation</Select.Label>
            <Select.Control {...selectStyles}>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Generation" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content
                  bg="white"
                  color="gray.800"
                  border="1px solid"
                  borderColor="gray.300"
                >
                  {genOptions.map((gen) => (
                    <Select.Item
                      item={gen}
                      key={gen.value}
                      _hover={{ bg: 'gray.100' }}
                      _selected={{ bg: 'blue.50', color: 'blue.700' }}
                    >
                      {gen.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          {/* Filtered Pokémon Grid */}
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
            {filteredPokemon.map((id) => (
              <GridItem key={id}>
                <PokemonPolaroid
                  props={{ id: id, masterSet: 100, grandmasterSet: 100 }}
                />
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
            defaultValue={['sv']}
            onValueChange={(e) => setSelectedEra(e.value[0])}
          >
            <Select.HiddenSelect />
            <Select.Label>Set Era</Select.Label>
            <Select.Control {...selectStyles}>
              <Select.Trigger>
                <Select.ValueText placeholder="Select an Era" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content
                  bg="white"
                  color="gray.800"
                  border="1px solid"
                  borderColor="gray.300"
                >
                  {eraOptions.items.map((era) => (
                    <Select.Item
                      item={era}
                      key={era.value}
                      _hover={{ bg: 'gray.100' }}
                      _selected={{ bg: 'blue.50', color: 'blue.700' }}
                    >
                      {era.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          {/* Display sets */}
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
                const imageSrc = set.logo || set.symbol;
                const setID = set.id;

                return (
                  <GridItem key={set.id}>
                    <PokemonSet
                      props={{
                        label: set.name,
                        image: imageSrc
                          ? `${imageSrc}.png`
                          : '/Images/temp_icon.svg',
                        setID: setID,
                        masterSet: 100,
                        grandmasterSet: 100,
                      }}
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
