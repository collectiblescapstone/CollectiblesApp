'use client'

// React
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// Chakra UI
import { Box, Button, HStack, Spinner, VStack } from '@chakra-ui/react'

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
    const [deleteCards, setDeleteCards] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        const loadData = async () => {
            if (!session) return
            const fetchedCards = await getUserCards(
                session.user.id,
                cardId || ''
            )
            // console.log('Fetched Cards:', fetchedCards) // Debug log
            setUserCards(fetchedCards)
            setLoading(false)
        }
        loadData()
    }, [cardId, session])

    // Trigger card refresh when coming back from edit
    useEffect(() => {
        // Use a small delay to ensure edit page has finished
        const timeout = setTimeout(() => {
            setRefreshTrigger((prev) => prev + 1)
        }, 500)
        return () => clearTimeout(timeout)
    }, [])

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
            <VStack width={'100%'} padding={2} gap={1}>
                <HStack width={'100%'} gap={1}>
                    <Button
                        size="sm"
                        backgroundColor="brand.marigold"
                        color="brand.turtoise"
                        onClick={() => {
                            window.location.href = `/edit-card?cardId=${cardId}`
                        }}
                        width={'50%'}
                    >
                        Add Card
                    </Button>

                    <Button
                        size="sm"
                        backgroundColor="brand.marigold"
                        color="brand.turtoise"
                        onClick={() => {
                            setDeleteCards(!deleteCards)
                        }}
                        width={'50%'}
                    >
                        Delete Cards
                    </Button>
                </HStack>
                {/*Cards Owned INFORMATION*/}
                {Array.from(userCards).map((cardId, id) => (
                    <PokemonCardInfo
                        key={id}
                        entryId={cardId}
                        deleteCard={deleteCards}
                        refreshTrigger={refreshTrigger}
                    />
                ))}
            </VStack>
        </Box>
    )
}

export default UserCardsPage
