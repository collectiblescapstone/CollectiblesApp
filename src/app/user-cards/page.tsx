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
import { userMasterSet, userPokemonMasterSet } from '@/utils/userPokemonCard'
import { getPokemonName, getGeneration } from '@/utils/pokedex'

// Types
import type { CardData } from '@/types/pokemon-card'
import { useAuth } from '@/context/AuthProvider'
import { getPokemonCards } from '@/utils/pokemonCard'
import { CardSearch } from '@/components/card-filter/CardSearch'

const UserCardsPage: React.FC = () => {
    // Search Params
    const searchParams = useSearchParams()
    const type = searchParams.get('type')

    // Authentification
    const { session, loading: authLoading } = useAuth()

    // Filters from search
    const [filteredIds, setFilteredIds] = useState<string[]>()

    // Local States
    const [loading, setLoading] = useState(true)


    if (loading || authLoading || !session)
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )

    return;

    //     return (
    //         <Box>
    //             <Flex mb={6} flexDirection="column" pl={5} pr={5} pt={5}>
    //                 <Flex justify="space-between" align="center">
    //                     <Heading>
    //                         {type === 'set'
    //                             ? `${setName} Card Set`
    //                             : `${type === 'set' ? setName : pokemonName} Cards`}
    //                     </Heading>
    //                     <Flex gap={1} align="right">
    //                         <IconButton
    //                             aria-label="Toggle sort order"
    //                             size="lg"
    //                             variant="ghost"
    //                             onClick={toggleSortOrder}
    //                         >
    //                             {ascending ? <LuChevronUp /> : <LuChevronDown />}
    //                         </IconButton>
    //                         <CardFilter />
    //                     </Flex>
    //                 </Flex>
    //                 <CardSearch cards={cards} setFilteredIds={setFilteredIds} />
    //             </Flex>
    //             {filteredCards.length === 0 ? (
    //                 <Text>No cards match the selected filters.</Text>
    //             ) : (
    //                 <HStack justify="center" gap={4} flexWrap="wrap" mb={4}>
    //                     {filteredCards.map((card, index) => (
    //                         <PokemonCardMini
    //                             cardId={card.id}
    //                             key={index}
    //                             cardName={card.name}
    //                             cardSetId={
    //                                 cardNumbers[card.id] +
    //                                 (Number(card.set.official) > 0
    //                                     ? '/' + card.set.official
    //                                     : '')
    //                             }
    //                             cardOwned={userCards.includes(card.id)}
    //                             image={card.image_url}
    //                         />
    //                     ))}
    //                 </HStack>
    //             )}
    //         </Box>
    //     )
}

export default UserCardsPage
