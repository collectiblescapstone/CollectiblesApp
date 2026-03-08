'use client'

// React
import { useEffect, useState } from 'react'

// Capacitor
import { CapacitorHttp } from '@capacitor/core'

// Chakra UI
import {
    Box,
    Button,
    HStack,
    Text,
    useDisclosure,
    VStack
} from '@chakra-ui/react'

// Next.js
import { useRouter } from 'next/navigation'

// Child Components
import PopupUI from '@/components/ui/PopupUI'

// Context
import { useAuth } from '@/context/AuthProvider'

// Icons
import { FaEye, FaPencilAlt, FaRegTrashAlt } from 'react-icons/fa'
import { IoSwapVertical } from 'react-icons/io5'
import { TbCards, TbPlayCard } from 'react-icons/tb'

// Utils
import {
    cardConditionsMap,
    parseGradeLevel
} from '@/utils/cardInfo/cardGrading'
import { getUserCard, refreshPokemonCards } from '@/utils/userPokemonCard'
import { capitalizeEachWord } from '@/utils/capitalize'
import { baseUrl } from '@/utils/constants'

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
    const router = useRouter()

    const [cardInfo, setCardInfo] = useState<Entry | null>(null)

    const [cardCondition, setCardCondition] = useState<string>('')

    const [isForTrade, setIsForTrade] = useState<boolean>(false)

    const [isForShowcase, setIsForShowcase] = useState<boolean>(false)

    const { onClose } = useDisclosure()

    const deleteCardHandler = async () => {
        if (!session) return
        try {
            // Delete card from database
            await CapacitorHttp.delete({
                url: `${baseUrl}/api/collection/delete`,
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                },
                data: JSON.stringify({ entryId })
            })

            if (onDelete) {
                onDelete(entryId)
            }

            PopupUI.close('confirm-delete')

            // Refresh data before router refresh
            refreshPokemonCards(session.user.id)
            window.location.reload()
        } catch (error) {
            console.error('Error deleting card:', error)
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
                                onClick={() =>
                                    PopupUI.open('confirm-delete', {
                                        title: 'Confirm deletion?',
                                        content: (
                                            <VStack gap={2}>
                                                <Text>
                                                    Are you sure you want to
                                                    delete this card? This
                                                    action cannot be undone.
                                                </Text>
                                                <HStack
                                                    gap={2}
                                                    width="100%"
                                                    justify="flex-start"
                                                >
                                                    <Button variant="outline">
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={async () => {
                                                            deleteCardHandler()
                                                        }}
                                                        background="red"
                                                    >
                                                        Delete Card
                                                    </Button>
                                                </HStack>
                                            </VStack>
                                        ),
                                        onClickClose: () =>
                                            PopupUI.close('confirm-delete')
                                    })
                                }
                            >
                                <FaRegTrashAlt size={24} fill="white" />
                            </Button>
                        )}
                    </HStack>
                    <PopupUI.Viewport />
                </Box>
            )}
        </Box>
    )
}
export default PokemonCardInfo
