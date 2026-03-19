'use client'

import { Box, Text, VStack, Image, Grid } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePokemonCards } from '@/context/PokemonCardsProvider'
import { CardData } from '@/types/pokemon-card'
import { CardSearcher } from '@/utils/identification/cardSearch'
import { SearchForCard } from '../SearchForCard'

const testCases = {
    // Specific card names
    "Ash's Pikachu": 'Pikachu wearing a hat',
    'Detective Pikachu':
        'Pikachu wearing a gray detective hat and holding a magnifying glass',
    'Gengar VMAX':
        'Huge purple ghost Gengar swallowing a whole building in a colorful trippy art style',
    'Shining Magikarp': 'golden magikarp in deep sea',
    'Rayquaza VMAX': 'Long green dragon flying over a forest',
    Melony: 'Girl making breakfast',
    'Galarian Meowth': 'A gray grinning fluffy cat',
    'Alolan Vulpix': 'Snowy squirrel',
    // Generic pokemons
    Rayquaza: 'Long green dragon',
    Blastoise: 'Blue turtle with water cannons',
    Snorlax: 'Chubby turqoise and white sleepy bear',
    Durant: 'A pale white ant standing on dirt',
    Snover: 'A mini mountain pokemon',
    Deerling: 'A bright deer',
    Psyduck: 'VERY CONFUSED DUCK',
    Darumaka: 'A red little munchkin',
    Fidough: 'A dog made of dough',
    Exeggcute: 'Half a dozen eggs',
    Falinks: 'Half a dozen black spheres',
    Wobbuffet: 'Happy blue pokemon with a black tail giving a salute',
    Riolu: 'Cute blue fighting pokemon',
    Onix: 'Long stream of rocks',
    Gible: 'A mini shark',
    Finizen: 'Dolphin',
    Pansear: 'Fire monkey',
    Timburr: 'A little guy carrying a log'
}

const numTestCases = Object.keys(testCases).length

export const TestSearchMetrics = () => {
    const cardSearch = useRef<Awaited<ReturnType<typeof CardSearcher>>>(null)
    const [matches, setMatches] = useState<
        Record<string, { card?: CardData; rank: number; speed: number }>
    >({})

    // Context
    const { allCards } = usePokemonCards()

    const idToCard = useMemo(() => {
        const temp: Record<string, CardData> = {}
        for (const card of allCards) {
            temp[card.id] = card
        }

        return temp
    }, [allCards])

    useEffect(() => {
        const init = async () => {
            cardSearch.current = await CardSearcher()

            const foundCards: typeof matches = {}
            for (const [cardName, cardDescription] of Object.entries(
                testCases
            )) {
                const startTime = performance.now()
                await cardSearch.current
                    .search(cardDescription, undefined, 200)
                    .then(async (data) => {
                        const endTime = performance.now()
                        const ids = data.map(({ id }) => id)

                        let rank = 0
                        let foundCard: CardData | undefined = undefined
                        for (let i = 0; i < ids.length; i++) {
                            const id = ids[i]
                            if (idToCard[id]?.name.includes(cardName)) {
                                rank = i + 1
                                foundCard = idToCard[id]
                                break
                            }
                        }

                        foundCards[cardName] = {
                            card: foundCard,
                            rank,
                            speed: Math.round((endTime - startTime) * 100) / 100
                        }
                    })
            }

            setMatches(foundCards)
        }

        init()
    }, [idToCard])

    const averageSpeed = useMemo(
        () =>
            (
                Object.values(matches).reduce(
                    (total, { speed }) => total + speed,
                    0
                ) / numTestCases
            ).toFixed(4),
        [matches]
    )

    const meanReciprocalRank = useMemo(
        () =>
            (
                Object.values(matches).reduce(
                    (total, { rank }) =>
                        rank === 0 ? total : total + 1 / rank,
                    0
                ) / numTestCases
            ).toFixed(4),
        [matches]
    )

    return (
        <VStack width="100%" p={2}>
            <VStack width="100vw">
                <Text fontSize="lg" fontWeight="bold">
                    Metrics
                </Text>
                <Box>
                    <Text>Speed (ms per image): {averageSpeed}</Text>
                    <Text>Mean Reciprocal Rank: {meanReciprocalRank}</Text>
                </Box>
            </VStack>
            <Grid
                templateColumns="repeat(3, 1fr)"
                gap="5"
                alignItems={'center'}
            >
                {Object.entries(testCases).map(
                    ([cardName, cardDescription]) => {
                        const match = matches[cardName]

                        return (
                            <VStack
                                w="20vw"
                                h="100%"
                                display={'flex'}
                                justifyContent={'center'}
                                border={'2px solid black'}
                                key={cardName}
                                padding={2}
                            >
                                <Text>{cardName}</Text>
                                <Text fontSize="small" textAlign="center">
                                    &quot;{cardDescription}&quot;
                                </Text>
                                {match && (
                                    <Image
                                        src={match.card?.image_url}
                                        alt={match.card?.name}
                                        w="105px"
                                        h="auto"
                                        borderRadius="none"
                                    />
                                )}
                                <Text>Rank #{match.rank}</Text>
                                <Text>{match.speed}ms</Text>
                            </VStack>
                        )
                    }
                )}
            </Grid>
            <Text>Test it yourself!</Text>
            <SearchForCard />
        </VStack>
    )
}
