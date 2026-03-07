'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
    const router = useRouter()

    // Authentification
    const { session, loading: authLoading } = useAuth()

    // Cards owned
    const [userCards, setUserCards] = useState<Set<string>>(new Set<string>())

    // Local States
    const [loading, setLoading] = useState(true)
    const [deleteCards, setDeleteCards] = useState(false)

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

    const handleCardDelete = (entryId: string) => {
        setUserCards((prevCards) => {
            const newCards = new Set(prevCards)
            newCards.delete(entryId)

            // If no cards remain, navigate back
            if (newCards.size === 0) {
                router.back()
            }

            return newCards
        })
    }

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
                        onDelete={handleCardDelete}
                    />
                ))}
            </VStack>
        </Box>
    )
}

export default UserCardsPage
