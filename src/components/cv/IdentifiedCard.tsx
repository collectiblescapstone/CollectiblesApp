'use client'

import { Box, Button, Flex, HStack, Image, Text } from '@chakra-ui/react'
import Link from 'next/link'

import { LuZap } from 'react-icons/lu'
import { FaPencilAlt } from 'react-icons/fa'

import { CardData } from '@/types/identification'
import { CapacitorHttp } from '@capacitor/core'
import { baseUrl } from '@/utils/constants'
import type { Session } from '@supabase/supabase-js'

interface IdentifiedCardProps {
    data: CardData
    imageURL: string
    session: Session | null
    instantAdded?: boolean
    onInstantAdd?: () => void
    onInstantAddSuccess?: () => void
}

export const IdentifiedCard = ({
    data,
    imageURL,
    session,
    instantAdded = false,
    onInstantAdd = () => {},
    onInstantAddSuccess = () => {}
}: IdentifiedCardProps) => {
    const instantAdd = async (card: CardData) => {
        instantAdded = true
        onInstantAdd()
        try {
            if (!session?.user?.id) return // Extra check to ensure user is authenticated before allowing submission
            const payload = {
                cardName: card.card.name,
                condition: 'near-mint',
                variant: 'normal',
                grade: 'Ungraded',
                gradeLevel: undefined,
                tags: [],
                cardId: card.card.id
            }

            const res = await CapacitorHttp.post({
                url: `${baseUrl}/api/collection/save`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                },
                data: JSON.stringify(payload)
            })

            if (res.status !== 200) {
                console.error('Save failed', res)
                alert(res.data.error || 'Failed to save card')
                return
            }

            refreshPokemonCards(session.user.id)
            onInstantAddSuccess()
        } catch (err) {
            console.error('Unexpected error saving card', err)
            alert(
                'Unexpected error saving card: ' +
                    (err instanceof Error ? err.message : String(err))
            )
        }
    }

    return (
        <Box>
            <HStack justifyContent="center">
                <Flex flexDirection="column">
                    <Box maxHeight="40vh" justifyItems="center">
                        <Image
                            src={imageURL}
                            maxHeight="30vh"
                            alt="identified card"
                        ></Image>
                    </Box>
                </Flex>
                <Flex
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                    mt={1}
                    gap={1}
                >
                    <Text>
                        {data?.card.name} ({data?.card.id.split('-')[1]})
                    </Text>
                    <Text>{data?.card.set.name}</Text>
                    <Link
                        href={{
                            pathname: '/user-cards',
                            query: {
                                cardId: data?.card.id ?? ''
                            }
                        }}
                    >
                        <Button width="13em">
                            <FaPencilAlt></FaPencilAlt>Configure Collection
                        </Button>
                    </Link>
                    <Button
                        width="13em"
                        onClick={() => instantAdd(data)}
                        disabled={!session || instantAdded}
                        backgroundColor={
                            instantAdded
                                ? 'rgb(102, 102, 105)'
                                : 'rgb(24, 24, 27)'
                        }
                    >
                        <LuZap></LuZap>Instant Add
                    </Button>
                </Flex>
            </HStack>
        </Box>
    )
}
