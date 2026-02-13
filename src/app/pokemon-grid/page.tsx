'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  HStack,
  Grid,
  GridItem,
  Portal,
  Select,
  Spinner,
  createListCollection,
} from '@chakra-ui/react';

// Child Components
import PokemonPolaroid from '@/components/pokemon-cards/pokemon-polaroid/PokemonPolaroid';
import PokemonSet from '@/components/pokemon-cards/pokemon-set/PokemonSet';

// Hooks
import { FiltersProvider } from '@/hooks/useFilters';

// Types
import { PokemonSetType } from '@/types/pokemon-grid';
import { useAuth } from '@/context/AuthProvider';

// Utils
import {
  POKEMONGEN,
  ALL_POKEMON,
} from '@/utils/pokedex';
import {
  masterSetCount,
  grandmasterSetCount,
  pokemonMasterSetCount,
  pokemonGrandmasterSetCount,
} from '@/utils/pokemonCard';

const PokemonGridPage = () => {
  const { session, loading } = useAuth();
  const [load, setLoad] = useState(true);
  const [selected, setSelected] = useState('set');
  const [selectedEra, setSelectedEra] = useState('sv');
  const [groupedSets, setGroupedSets] = useState<
    Record<string, PokemonSetType[]>
  >({});
  const [selectedGen, setSelectedGen] = useState('ALL');

  const [setCounts, setSetCounts] = useState<
    Record<string, { masterSet: number; grandmasterSet: number }>
  >({});

  const [pokemonCounts, setPokemonCounts] = useState<
    Record<string, { masterSet: number; grandmasterSet: number }>
  >({});

  const pokemon = ALL_POKEMON;

  const frameworks = createListCollection({
    items: [
      { label: 'Set', value: 'set' },
      { label: 'Pokémon', value: 'pokemon' },
    ],
  });

  // Generation options
  const genOptions = [
    { label: 'ALL', value: 'ALL' },
    ...POKEMONGEN.map((last, index) => ({
      label: `Gen ${index + 1}`,
      value: (index + 1).toString(),
    })),
  ];

  const setEras = [
    { label: 'Mega Evolution', value: 'me' },
    { label: 'Scarlet & Violet', value: 'sv' },
    { label: 'Sword & Shield', value: 'swsh' },
    { label: 'Sun & Moon', value: 'sm' },
    { label: 'X & Y', value: 'xy' },
    { label: 'Black & White', value: 'bw' },
    { label: 'HeartGold & SoulSilver', value: 'hgss' },
    { label: 'Platinum', value: 'pl' },
    { label: 'Diamond & Pearl', value: 'dp' },
    { label: 'Pop Series', value: 'pop' },
    { label: 'e-Card', value: 'ecard' },
    { label: 'EX', value: 'ex' },
    { label: 'Neo Genesis', value: 'neo' },
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
    fetch('/api/pokemon-set')
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
          ex: [],
          neo: [],
          pl: [],
          hgss: [],
          pop: [],
          ecard: [],
        };

        sets.forEach((set) => {
          const id = set.id?.toLowerCase() ?? '';
          if (id.includes('sv')) groups.sv.push(set);
          else if (id.includes('swsh')) groups.swsh.push(set);
          else if (id.includes('sm')) groups.sm.push(set);
          else if (id.includes('xy')) groups.xy.push(set);
          else if (id.includes('bw')) groups.bw.push(set);
          else if (id.includes('hgss') || id.includes('tk-hs'))
            groups.hgss.push(set);
          else if (id.includes('pl')) groups.pl.push(set);
          else if (id.includes('dp')) groups.dp.push(set);
          else if (id.includes('me')) groups.me.push(set);
          else if (id.includes('ex')) groups.ex.push(set);
          else if (id.includes('ecard')) groups.ecard.push(set);
          else if (id.includes('pop')) groups.pop.push(set);
          else if (id.includes('neo') || id.includes('si'))
            groups.neo.push(set);
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
  const filteredPokemon = useMemo(() => {
    if (selectedGen === 'ALL') return pokemon;

    const genIndex = parseInt(selectedGen) - 1;
    const startId = genIndex === 0 ? 1 : POKEMONGEN[genIndex - 1] + 1;
    const endId = POKEMONGEN[genIndex];

    return pokemon.filter((id) => id >= startId && id <= endId);
  }, [selectedGen, pokemon]);

  /**
   * useEffect to fetch set counts
   */
  useEffect(() => {
    if (!selectedEra || !groupedSets[selectedEra] || selected !== 'set') return;

    const fetchCounts = async () => {
      setLoad(true);

      const counts: Record<
        string,
        { masterSet: number; grandmasterSet: number }
      > = {};

      await Promise.all(
        groupedSets[selectedEra].map(async (set) => {
          const master = await masterSetCount(set.id);
          const grandmaster = await grandmasterSetCount(set.id);
          counts[set.id] = {
            masterSet: master ?? 0,
            grandmasterSet: grandmaster ?? 0,
          };
        })
      );

      setSetCounts(counts);
      setLoad(false);
    };

    fetchCounts();
  }, [selectedEra, groupedSets, selected]);

  /**
   * Use effect for fetching Pokemon card counts, grouped by Pokedex number.
   */
  useEffect(() => {
    if (!selectedGen || selected !== 'pokemon') return;
    let cancelled = false;
    const fetchCounts = async () => {
      setLoad(true);

      const counts: Record<
        number,
        { masterSet: number; grandmasterSet: number }
      > = {};

      for (const id of filteredPokemon) {
        if (cancelled) return;

        const master = await pokemonMasterSetCount(id);
        const grandmaster = await pokemonGrandmasterSetCount(id);
        if (cancelled) return;
        counts[id] = {
          masterSet: master ?? 0,
          grandmasterSet: grandmaster ?? 0,
        };
        // console.log(
        //   id +
        //     '|: ' +
        //     pokemonName +
        //     '   ' +
        //     counts[pokemonName].masterSet +
        //     '|' +
        //     counts[pokemonName].grandmasterSet
        // );
      }

      setPokemonCounts(counts);
      setLoad(false);
    };

    fetchCounts();
    return () => {
      cancelled = true;
    };
  }, [selectedGen, selected, filteredPokemon]);

  if (loading || !session || load) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <FiltersProvider>
      <Box bg="white" minH="100vh" color="black">
        <HStack justify="center" width="100%" gap={1} padding={2}>
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

          {/* Pokemon Generation dropdown */}
          {selected === 'pokemon' && (
            <Select.Root
              collection={createListCollection({ items: genOptions })}
              size="sm"
              width="200px"
              defaultValue={['ALL']}
              onValueChange={(val) => setSelectedGen(val.value[0])}
              textAlign={'right'}
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
          )}

          {/* Set Era dropdown */}
          {selected === 'set' && (
            <Select.Root
              collection={eraOptions}
              size="sm"
              width="300px"
              defaultValue={['sv']}
              onValueChange={(e) => setSelectedEra(e.value[0])}
              textAlign={'right'}
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
          )}
        </HStack>

        {/* Pokémon Grid View */}
        {selected === 'pokemon' && (
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={1}
            justifyItems="center"
            mt={4}
          >
            {filteredPokemon.map((id) => {
              console.log(id);
              const counts = pokemonCounts[id] || {
                masterSet: 1,
                grandmasterSet: 1,
              };
              return (
                <PokemonPolaroid
                  key={id}
                  id={id}
                  masterSet={counts.masterSet}
                  grandmasterSet={counts.grandmasterSet}
                />
              );
            })}
          </Grid>
        )}

        {/* Set Era View */}
        {selected === 'set' && selectedEra && groupedSets[selectedEra] && (
          <Grid mt="30px" templateColumns="repeat(1, 1fr)" gap="20px">
            {groupedSets[selectedEra].map((set) => {
              const imageSrc = set.logo || set.symbol;
              const counts = setCounts[set.id] || {
                masterSet: 1,
                grandmasterSet: 1,
              };
              // console.log(
              //   set.id + ': ' + counts.masterSet + '|' + counts.grandmasterSet
              // );
              return (
                <GridItem key={set.id}>
                  <PokemonSet
                    label={set.name}
                    image={
                      imageSrc ? `${imageSrc}.png` : '/Images/temp_icon.svg'
                    }
                    setName={set.name}
                    setID={set.id}
                    masterSet={counts.masterSet}
                    grandmasterSet={counts.grandmasterSet}
                  />
                </GridItem>
              );
            })}
          </Grid>
        )}
      </Box>
    </FiltersProvider>
  );
};

export default PokemonGridPage;
