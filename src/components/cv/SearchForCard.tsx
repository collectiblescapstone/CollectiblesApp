'use client'

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent
} from 'react'
import { Flex, Image, Input } from '@chakra-ui/react'
import { CardSearcher } from '@/utils/identification/cardSearch'
import Divider from '@/components/profiles/Divider'
import { type CardData } from '@/types/pokemon-card'
import { getPokemonCards } from '@/utils/pokemonCard'

export const SearchForCard: React.FC = () => {
    const cardSearch = useRef<Awaited<ReturnType<typeof CardSearcher>>>(null)
    const [csReady, setCSReady] = useState(false)
    const [matches, setMatches] = useState<
        {
            id: string
            score: number
            card?: CardData
        }[]
    >()

    useEffect(() => {
        const init = async () => {
            cardSearch.current = await CardSearcher()
            setCSReady(true)
        }

        init()
    }, [])

    const handleSearch = useCallback(
        (evt: KeyboardEvent<HTMLInputElement>) => {
            if (!csReady || !cardSearch.current) {
                return
            }

            if (evt.key === 'Enter') {
                cardSearch.current
                    .search(evt.currentTarget.value)
                    .then(async (data) => {
                        const ids = data.map(({ id }) => id)
                        const cards = await getPokemonCards({ ids })

                        setMatches(
                            data.map((match) => ({
                                ...match,
                                card: cards.find((card) => card.id === match.id)
                            }))
                        )
                    })
            }
        },
        [csReady]
    )

    return (
        <Flex
            flexDirection="column"
            gap={2}
            justifyContent="flex-start"
            alignItems="flex-start"
            w="100%"
            px={4}
        >
            <Divider />
            <Input onKeyDown={handleSearch}></Input>
            <Flex
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                wrap="wrap"
                gap={5}
            >
                {matches?.map((match, index) => (
                    <Flex
                        key={index}
                        flexDirection={'column'}
                        alignItems={'center'}
                    >
                        <div>
                            Score: {Math.round(match.score * 1000) / 1000}
                        </div>
                        <Image
                            src={match.card?.image_url}
                            alt={match.id}
                            w="105px"
                            h="auto"
                            borderRadius="none"
                        />
                    </Flex>
                ))}
            </Flex>
        </Flex>
    )
}
