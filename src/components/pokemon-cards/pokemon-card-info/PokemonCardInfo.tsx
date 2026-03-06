'use client'

import { useEffect, useState } from 'react'
import { Box, Button, HStack, VStack } from '@chakra-ui/react'

// Context
import { useAuth } from '@/context/AuthProvider'

// Icons
import { FaEye, FaPencilAlt } from 'react-icons/fa'
import { AiOutlineSwap } from 'react-icons/ai'
import { TbCards, TbPlayCard } from 'react-icons/tb'

// Utils
import { cardConditionsMap, gradeName } from '@/utils/cardInfo/cardGrading'
import { getUserCard } from '@/utils/userPokemonCard'
import { capitalizeEachWord } from '@/utils/capitalize'

// Types
import type { Entry } from '@/utils/userPokemonCard'

interface PokemonCardInfoProps {
    entryId: string
}

const PokemonCardInfo = ({ entryId }: PokemonCardInfoProps) => {
    // Authentification
    const { session } = useAuth()

    const [cardInfo, setCardInfo] = useState<Entry | null>(null)

    const [cardCondition, setCardCondition] = useState<string>('')

    const [isForTrade, setIsForTrade] = useState<boolean>(false)

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
                    setCardCondition(gradeName(card?.gradeLevel || ''))
                }

                setIsForTrade(card?.forTrade ?? false)
            } catch (error) {
                console.error('Error fetching card information:', error)
            }
        }
        fetchCardInfo()
    }, [entryId, session])

    return (
        <Box width="100%" padding="4" borderWidth="3px" borderRadius="lg">
            {cardInfo && (
                <Box height="50px">
                    <HStack>
                        <VStack align="start" width={'60%'} gap={1}>
                            <HStack>
                                <TbCards />{' '}
                                {capitalizeEachWord(cardInfo.variant)}
                            </HStack>
                            <HStack>
                                <TbPlayCard /> {cardCondition}
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
                            <FaEye size={24} />
                            {isForTrade && <AiOutlineSwap size={24} />}
                        </HStack>
                        <Button
                            height="50px"
                            width="50px"
                            backgroundColor="brand.marigold"
                            onClick={() => {
                                window.location.href = `/edit-card?cardId=${cardInfo.cardId}&entryId=${entryId}`
                            }}
                        >
                            <FaPencilAlt size={24} fill="#003B49" />
                        </Button>
                    </HStack>
                </Box>
            )}
        </Box>
    )
}
export default PokemonCardInfo
