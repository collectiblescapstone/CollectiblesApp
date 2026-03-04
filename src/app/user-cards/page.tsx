'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    Box,
    Button,
    Spinner,
    VStack
} from '@chakra-ui/react'

// Context
import { useAuth } from '@/context/AuthProvider'

// Child Components
import PokemonCardHeader from '@/components/pokemon-cards/pokemon-card-header/PokemonCardHeader'
import PokemonCardInfo from '@/components/pokemon-cards/pokemon-card-info/PokemonCardInfo'

// Utils
import { getUserCards } from '@/utils/userPokemonCard'


const UserCardsPage: React.FC = () => {
    // Search Params
    const searchParams = useSearchParams()
    const cardId = searchParams.get('cardId')

    // Authentification
    const { session, loading: authLoading } = useAuth()


    // Cards owned
    const [userCards, setUserCards] = useState<Set<string>>(new Set<string>())

    // Local States
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (!session) return
            const fetchedCards = await getUserCards(session.user.id, cardId || '')
            // console.log('Fetched Cards:', fetchedCards) // Debug log
            setUserCards(fetchedCards)
            setLoading(false)
        }
        loadData()
    }, [cardId, session])


    if (loading || authLoading || !session)
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )


    return (
        <Box>
            {/*CARD HEADER INFORMATION*/}
            <PokemonCardHeader cardId={cardId || ''} />
            {/*ADD NEW CARD BUTTON*/}
            <VStack width={"100%"} padding={4} gap={4}>
                <Button
                    size="sm"
                    backgroundColor="brand.marigold"
                    color="brand.turtoise"
                    onClick={() => {
                        window.location.href = `/edit-card?cardId=${cardId}`
                    }}
                    width={"100%"}
                >
                    Add Card

                </Button>
                {/*Cards Owned INFORMATION*/}
                {Array.from(userCards).map((cardId, id) => (
                    <PokemonCardInfo key={id} entryId={cardId} />
                ))}
            </VStack>
        </Box>
    )
}

export default UserCardsPage
