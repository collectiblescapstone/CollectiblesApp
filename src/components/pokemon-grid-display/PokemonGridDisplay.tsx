'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
    Box,
    HStack,
    Grid,
    GridItem,
    Portal,
    Select,
    Spinner,
    createListCollection,
    Pagination,
    Stack,
    IconButton
} from '@chakra-ui/react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

// Child Components
import PokemonPolaroid from '@/components/pokemon-cards/pokemon-polaroid/PokemonPolaroid'
import PokemonPolaroidLoading from '@/components/pokemon-cards/pokemon-polaroid/PokemonPolaroidLoading'
import PokemonSet from '@/components/pokemon-cards/pokemon-set/PokemonSet'
import PokemonSetLoading from '@/components/pokemon-cards/pokemon-set/PokemonSetLoading'
import { CardSearch } from '@/components/card-filter/CardSearch'
import { getSetGroups } from '@/utils/pokemonSet'

// Hooks
import { FiltersProvider } from '@/hooks/useFilters'

// Types
import { PokemonSetType } from '@/types/pokemon-grid'
import { useAuth } from '@/context/AuthProvider'

// Utils
import { POKEMONGEN, ALL_POKEMON, getPokemonName } from '@/utils/pokedex'
import {
    masterSetCount,
    grandmasterSetCount,
    pokemonMasterSetCount,
    pokemonGrandmasterSetCount
} from '@/utils/pokemonCard'

const NUM_ITEMS_PER_PAGE = 24

interface PokemonGridDisplayProps {
    originalPage: string
}

const PokemonGridDisplay = ({ originalPage }: PokemonGridDisplayProps) => {
    // EDIT THIS LINE FOR THE PAGE TYPE (WISHLIST)
    const nextPage =
        originalPage === 'pokemon-grid'
            ? '/filter-cards'
            : '/wishlist-filter-cards'

    const { session, loading } = useAuth()
    const [filteredIds, setFilteredIds] = useState<string[]>()
    const [filteredPokemonData, setFilteredPokemonData] = useState<
        {
            id: string
            name: string
        }[]
    >()
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState('set')
    const [selectedEra, setSelectedEra] = useState('sv')
    const [groupedSets, setGroupedSets] = useState<
        Record<string, PokemonSetType[]>
    >({})
    const [selectedGen, setSelectedGen] = useState('ALL')

    const [setCounts, setSetCounts] = useState<
        Record<string, { masterSet: number; grandmasterSet: number }>
    >({})

    const [pokemonCounts, setPokemonCounts] = useState<
        Record<string, { masterSet: number; grandmasterSet: number }>
    >({})

    const pokemon = ALL_POKEMON

    const frameworks = createListCollection({
        items: [
            { label: 'Set', value: 'set' },
            { label: 'Pokémon', value: 'pokemon' }
        ]
    })

    // Generation options
    const genOptions = [
        { label: 'ALL', value: 'ALL' },
        ...POKEMONGEN.map((last, index) => ({
            label: `Gen ${index + 1}`,
            value: (index + 1).toString()
        }))
    ]

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
        { label: 'Other', value: 'other' }
    ]

    const eraOptions = createListCollection({
        items: setEras.map((era) => ({
            label: era.label,
            value: era.value
        }))
    })

    useEffect(() => {
        const fetchGroups = async () => {
            setGroupedSets(await getSetGroups())
        }
        fetchGroups()
    }, [])

    const selectStyles = {
        bg: 'gray.50',
        color: 'gray.800',
        border: '1px solid',
        borderColor: 'gray.300',
        _hover: { bg: 'gray.100' },
        _focusWithin: {
            borderColor: 'blue.400',
            boxShadow: '0 0 0 1px #63b3ed'
        }
    }

    // Filter Pokémon based on selected generation
    const filteredPokemon = useMemo(() => {
        if (selectedGen === 'ALL') {
            return pokemon
        }

        const genIndex = parseInt(selectedGen) - 1
        const startId = genIndex === 0 ? 1 : POKEMONGEN[genIndex - 1] + 1
        const endId = POKEMONGEN[genIndex]

        return pokemon.filter((id) => id >= startId && id <= endId)
    }, [selectedGen, pokemon])

    /**
     * useEffect to fetch set counts
     */
    useEffect(() => {
        if (!selectedEra || !groupedSets[selectedEra] || selected !== 'set')
            return

        const fetchCounts = async () => {
            const counts: Record<
                string,
                { masterSet: number; grandmasterSet: number }
            > = {}

            await Promise.all(
                groupedSets[selectedEra].map(async (set) => {
                    const master = await masterSetCount(set.id)
                    const grandmaster = await grandmasterSetCount(set.id)
                    counts[set.id] = {
                        masterSet: master ?? 0,
                        grandmasterSet: grandmaster ?? 0
                    }
                })
            )

            setSetCounts(counts)
        }

        fetchCounts()
    }, [selectedEra, groupedSets, selected])

    /**
     * Use effect for fetching Pokemon card counts, grouped by Pokedex number.
     */
    useEffect(() => {
        if (!selectedGen || selected !== 'pokemon') return
        const fetchCounts = async () => {
            const counts: Record<
                number,
                { masterSet: number; grandmasterSet: number }
            > = {}

            await Promise.allSettled(
                filteredPokemon.map(async (id) => {
                    const master = await pokemonMasterSetCount(id)
                    const grandmaster = await pokemonGrandmasterSetCount(id)
                    counts[id] = {
                        masterSet: master ?? 0,
                        grandmasterSet: grandmaster ?? 0
                    }
                })
            )

            setPokemonCounts(counts)
        }

        fetchCounts()
    }, [selectedGen, selected, filteredPokemon])

    useEffect(() => {
        const fetchNames = async () => {
            const data: { id: string; name: string }[] = []
            await Promise.allSettled(
                filteredPokemon.map(async (id) =>
                    data.push({
                        id: id.toString(),
                        name: await getPokemonName(id)
                    })
                )
            )

            setFilteredPokemonData(data)
        }

        fetchNames()
    }, [filteredPokemon])

    const displayablePokemon = useMemo(
        () =>
            filteredIds
                ? filteredPokemon.filter((id) =>
                    filteredIds.includes(id.toString())
                )
                : filteredPokemon,
        [filteredPokemon, filteredIds]
    )

    useEffect(() => {
        setPage(1)
    }, [displayablePokemon])

    if (loading || !session) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )
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
                        value={[selected]}
                        onValueChange={(e) => {
                            setSelected(e.value[0])
                            setSelectedEra('sv')
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
                                            _selected={{
                                                bg: 'blue.50',
                                                color: 'blue.700'
                                            }}
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
                            collection={createListCollection({
                                items: genOptions
                            })}
                            size="sm"
                            width="200px"
                            defaultValue={['ALL']}
                            onValueChange={(val) =>
                                setSelectedGen(val.value[0])
                            }
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
                                                _selected={{
                                                    bg: 'blue.50',
                                                    color: 'blue.700'
                                                }}
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
                                                _selected={{
                                                    bg: 'blue.50',
                                                    color: 'blue.700'
                                                }}
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

                {/* Pokémon Grid Search */}
                {selected === 'pokemon' && (
                    <Box paddingX={2}>
                        <CardSearch
                            cards={filteredPokemonData}
                            setFilteredIds={setFilteredIds}
                            filterOnly
                        />
                    </Box>
                )}

                {/* Pokémon Grid View */}
                {selected === 'pokemon' && (
                    <Stack width="100%" justify={'center'}>
                        <Grid
                            templateColumns="repeat(2, 1fr)"
                            gap={1}
                            justifyItems="center"
                            mt={4}
                        >
                            {displayablePokemon
                                .slice(
                                    (page - 1) * NUM_ITEMS_PER_PAGE,
                                    Math.min(
                                        page * NUM_ITEMS_PER_PAGE,
                                        filteredPokemon.length
                                    )
                                )
                                .map((id) => {
                                    const counts = pokemonCounts[id]
                                    if (!counts) {
                                        return (
                                            <PokemonPolaroidLoading key={id} />
                                        )
                                    }
                                    return (
                                        <PokemonPolaroid
                                            key={id}
                                            id={id}
                                            masterSet={counts.masterSet}
                                            grandmasterSet={
                                                counts.grandmasterSet
                                            }
                                            nextPage={nextPage}
                                        />
                                    )
                                })}
                        </Grid>
                        <Pagination.Root
                            count={displayablePokemon.length}
                            pageSize={NUM_ITEMS_PER_PAGE}
                            page={page}
                            onPageChange={(e) => setPage(e.page)}
                            textAlign={'center'}
                            paddingBottom={2}
                        >
                            <Pagination.PrevTrigger asChild>
                                <IconButton>
                                    <HiChevronLeft />
                                </IconButton>
                            </Pagination.PrevTrigger>
                            <Pagination.Items
                                render={(page) => (
                                    <IconButton
                                        variant={{
                                            base: 'ghost',
                                            _selected: 'outline'
                                        }}
                                    >
                                        {page.value}
                                    </IconButton>
                                )}
                            />
                            <Pagination.NextTrigger asChild>
                                <IconButton>
                                    <HiChevronRight />
                                </IconButton>
                            </Pagination.NextTrigger>
                        </Pagination.Root>
                    </Stack>
                )}

                {/* Set Era View */}
                {selected === 'set' &&
                    selectedEra &&
                    groupedSets[selectedEra] && (
                        <Grid
                            mt="30px"
                            templateColumns="repeat(1, 1fr)"
                            gap="20px"
                        >
                            {groupedSets[selectedEra].map((set) => {
                                const imageSrc = set.logo || set.symbol
                                const counts = setCounts[set.id]

                                if (!counts) {
                                    return (
                                        <GridItem key={set.id}>
                                            <PokemonSetLoading />
                                        </GridItem>
                                    )
                                }

                                return (
                                    <GridItem key={set.id}>
                                        <PokemonSet
                                            label={set.name}
                                            image={imageSrc ? `${imageSrc}.png` : '/Images/temp_icon.svg'}
                                            setName={set.name}
                                            setID={set.id}
                                            masterSet={counts.masterSet}
                                            grandmasterSet={counts.grandmasterSet}
                                            nextPage={nextPage}
                                        />
                                    </GridItem>
                                )
                            })}
                        </Grid>
                    )}
            </Box>
        </FiltersProvider>
    )
}

export default PokemonGridDisplay
