'use client'

import { useEffect, useState } from 'react'
import { Box, Button, HStack, VStack } from '@chakra-ui/react'

// Context
import { useAuth } from '@/context/AuthProvider'

// Icons
import { FaEye, FaPencilAlt, FaRegTrashAlt } from 'react-icons/fa'
import { IoSwapVertical } from 'react-icons/io5'
import { TbCards, TbPlayCard } from 'react-icons/tb'

// Utils
import {
    cardConditionsMap,
    gradeName,
    parseGradeLevel
} from '@/utils/cardInfo/cardGrading'
import { getUserCard, refreshPokemonCards } from '@/utils/userPokemonCard'
import { capitalizeEachWord } from '@/utils/capitalize'

// Types
import type { Entry } from '@/utils/userPokemonCard'

// Pokemon Card Info Props
interface PokemonCardInfoProps {
    entryId: string
    deleteCard: boolean
    onDelete?: (entryId: string) => void
    refreshTrigger?: number
}

const PokemonCardInfo = ({
    entryId,
    deleteCard,
    onDelete,
    refreshTrigger
}: PokemonCardInfoProps) => {
    // Authentification
    const { session } = useAuth()

    const [cardInfo, setCardInfo] = useState<Entry | null>(null)

    const [cardCondition, setCardCondition] = useState<string>('')

    const [isForTrade, setIsForTrade] = useState<boolean>(false)

    const [isForShowcase, setIsForShowcase] = useState<boolean>(false)

    const deleteCardHandler = () => {
        if (!session) return
        if (window.confirm('Are you sure you want to delete this card?')) {
            // Call API to delete card
            fetch('/api/collection/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ entryId })
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log('Delete response:', data)
                    refreshPokemonCards(session.user.id)
                    // Notify parent component of successful deletion
                    if (onDelete) {
                        onDelete(entryId)
                    }
                })
                .catch((error) => {
                    console.error('Error deleting card:', error)
                    // Optionally, you can add some error feedback to the user here
                })
        }
    }

    useEffect(() => {
        const fetchCardInfo = async () => {
            try {
                if (!session) return
                const card = await getUserCard(session.user.id, entryId)
                setCardInfo(card)

                // Change the card condition
                if (card?.grade === null || card?.gradeLevel === null) {
                    setCardCondition(
                        cardConditionsMap[card?.condition ?? 'near-mint'] ??
                            'Near Mint'
                    )
                } else {
                    const gradeLevel = parseGradeLevel(
                        card?.grade || '',
                        card?.gradeLevel || ''
                    )
                    setCardCondition(card?.grade + ' ' + gradeLevel)
                }

                setIsForTrade(card?.forTrade ?? false)
                setIsForShowcase(card?.showcase ?? false)
            } catch (error) {
                console.error('Error fetching card information:', error)
            }
        }
        fetchCardInfo()
    }, [entryId, session, refreshTrigger])

    return (
        <Box width="100%" padding="4" borderWidth="3px" borderRadius="lg">
            {cardInfo && (
                <Box height="100%">
                    <HStack>
                        <VStack align="start" width={'60%'} gap={1}>
                            <HStack>
                                <TbCards />{' '}
                                {capitalizeEachWord(cardInfo.variant)}
                            </HStack>
                            <HStack>
                                <TbPlayCard />{' '}
                                {capitalizeEachWord(cardCondition)}
                            </HStack>
                        </VStack>
                        <HStack
                            align="end"
                            width={'40%'}
                            justify="end"
                            justifyContent="flex-end"
                            gap={2}
                            direction="row-reverse"
                        >
                            {isForShowcase && <FaEye size={24} />}
                            {isForTrade && <IoSwapVertical size={24} />}
                        </HStack>
                        {/*DELETE CARD*/}
                        {!deleteCard ? (
                            <Button
                                height="50px"
                                width="50px"
                                background="black"
                                onClick={() => {
                                    window.location.href = `/edit-card?cardId=${cardInfo.cardId}&entryId=${entryId}`
                                }}
                            >
                                <FaPencilAlt size={24} fill="white" />
                            </Button>
                        ) : (
                            <Button
                                height="50px"
                                width="50px"
                                background="red"
                                onClick={() => {
                                    deleteCardHandler()
                                }}
                            >
                                <FaRegTrashAlt size={24} fill="white" />
                            </Button>
                        )}
                    </HStack>
                </Box>
            )}
        </Box>
    )
}
export default PokemonCardInfo
