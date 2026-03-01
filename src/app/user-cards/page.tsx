'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    Box,
    Flex,
    HStack,
    Heading,
    IconButton,
    Spinner,
    Text
} from '@chakra-ui/react'
import { LuChevronUp, LuChevronDown } from 'react-icons/lu'

// Child Components
import PokemonCardMini from '@/components/pokemon-cards/pokemon-card-mini/PokemonCardMini'
import CardFilter from '@/components/card-filter/CardFilter'

// Hooks
import { useFilters } from '@/hooks/useFilters'

// Utils
import { getUserCards } from '@/utils/userPokemonCard'

// Types
import { useAuth } from '@/context/AuthProvider'
import { CardCollectionEntry } from '@/types/collection-card'

const UserCardsPage: React.FC = () => {
    // Search Params
    const searchParams = useSearchParams()
    const cardId = searchParams.get('cardId')

    // Authentification
    const { session, loading: authLoading } = useAuth()

    // Filters from search
    const [filteredIds, setFilteredIds] = useState<string[]>()

    // Cards owned
    const [userCards, setUserCards] = useState<CardCollectionEntry[]>([])

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


            {/*Cards Owned INFORMATION*/}
            {userCards.map((card, id) => (
                <Text key={id}>
                    Condition: {card.condition || 'None'}, Variant: {card.variant}
                </Text>
            ))}
        </Box>
    )
}

export default UserCardsPage
