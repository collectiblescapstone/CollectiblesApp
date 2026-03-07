'use client'

// React
import { useEffect, useState } from 'react'

// Chakra UI
import {
    Box,
    Button,
    CloseButton,
    Dialog,
    HStack,
    Portal,
    useDisclosure,
    VStack
} from '@chakra-ui/react'

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

    const { open, onOpen, onClose } = useDisclosure()

    const deleteCardHandler = async () => {
        if (!session) return
        try {
            const response = await fetch('/api/collection/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ entryId })
            })
            const data = await response.json()
            console.log('Delete response:', data)
            refreshPokemonCards(session.user.id)
            if (onDelete) {
                onDelete(entryId)
            }
            onClose()
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
                            <Dialog.Root>
                                <Dialog.Trigger asChild>
                                    <Button
                                        height="50px"
                                        width="50px"
                                        background="red"
                                        onClick={onOpen}
                                    >
                                        <FaRegTrashAlt size={24} fill="white" />
                                    </Button>
                                </Dialog.Trigger>
                                <Portal>
                                    <Dialog.Backdrop />
                                    <Dialog.Positioner
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Dialog.Content>
                                            <Dialog.Header>
                                                <Dialog.Title>
                                                    Confirm deletion?
                                                </Dialog.Title>
                                            </Dialog.Header>
                                            <Dialog.Body>
                                                <p>
                                                    Are you sure you want to
                                                    delete this card? This
                                                    action cannot be undone.
                                                </p>
                                            </Dialog.Body>
                                            <Dialog.Footer>
                                                <Dialog.ActionTrigger asChild>
                                                    <Button variant="outline">
                                                        Cancel
                                                    </Button>
                                                </Dialog.ActionTrigger>
                                                <Button
                                                    onClick={async () => {
                                                        deleteCardHandler()
                                                    }}
                                                    background="red"
                                                >
                                                    Delete Card
                                                </Button>
                                            </Dialog.Footer>
                                            <Dialog.CloseTrigger asChild>
                                                <CloseButton size="sm" />
                                            </Dialog.CloseTrigger>
                                        </Dialog.Content>
                                    </Dialog.Positioner>
                                </Portal>
                            </Dialog.Root>
                        )}
                    </HStack>
                </Box>
            )}
        </Box>
    )
}
export default PokemonCardInfo
