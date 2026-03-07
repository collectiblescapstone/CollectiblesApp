'use client'

// Capacitor
import { CapacitorHttp } from '@capacitor/core'
import {
    Button,
    Field,
    TagsInput,
    Select,
    Portal,
    Box,
    createListCollection,
    Listbox,
    Spinner,
    ListCollection,
    VStack,
    HStack,
    Text
} from '@chakra-ui/react'

// React
import React, { useMemo, useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FaEye } from 'react-icons/fa'
import { AiOutlineSwap } from 'react-icons/ai'
import { RxCross1 } from 'react-icons/rx'

// Next.js
import { useSearchParams } from 'next/navigation'

// Zod
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Child Components
import CombinedIcons from '@/components/combined-icons/CombinedIcons'
import PokemonCardHeader from '@/components/pokemon-cards/pokemon-card-header/PokemonCardHeader'

// Context
import { useAuth } from '@/context/AuthProvider'
import { usePokemonCards } from '@/context/PokemonCardsProvider'

// Types
import type { PokemonCard } from '@/types/Cards/frontend-card'

// Utils
import { baseUrl } from '@/utils/constants'
import {
    cardConditions,
    gradeDetailsMap,
    gradingCompanies
} from '@/utils/cardInfo/cardGrading'
import { capitalizeEachWord } from '@/utils/capitalize'
import { refreshPokemonCards } from '@/utils/userPokemonCard'

interface FormValues {
    CardName: string
    CardSet: string
    CardGrade: string[]
    CardGradeDetail?: string[]
    Condition?: string
    FoilPattern?: string
    Tags?: string[]
    Showcase: boolean
    MarkedForTrade: boolean
}

const formSchema = z.object({
    CardName: z.string().min(1, 'Item name is required'),
    CardSet: z.string().min(1, 'Item set is required'),
    CardGrade: z.array(z.string()).min(1, 'Card Grade is required'),
    CardGradeDetail: z.array(z.string()).optional(),
    Condition: z.string().optional(),
    FoilPattern: z.string().optional(),
    Tags: z.array(z.string()).optional(),
    Showcase: z.boolean(),
    MarkedForTrade: z.boolean()
})

const grades = createListCollection({
    items: gradingCompanies
})

const conditions = createListCollection({
    items: cardConditions
})

/**
 *
 * @returns
 */
const EditCardPage = () => {
    type SelectPayload = { value?: string | string[] }
    const { getCardInformation } = usePokemonCards()

    const { session, loading } = useAuth()
    const searchParams = useSearchParams()

    // Showcase and Mark for Trade booleans
    const [showcase, setShowcase] = useState(false)
    const [markedForTrade, setMarkedForTrade] = useState(false)

    const id = searchParams.get('cardId') ?? ''

    // Card information
    const [cardInfo, setCardInfo] = useState<PokemonCard | undefined>(undefined)
    const [cardFoils, setCardFoils] =
        useState<ListCollection<{ label: string; value: string }>>()

    useEffect(() => {
        let active = true

        const fetchCardInfo = async () => {
            const info = await getCardInformation(id)
            if (!active || !info) return

            setCardInfo(info)

            // MODIFY THIS ONCE I DO EDIT CARD. CURRENTLY CHANGING IT TO WORK FOR ADD CARD

            // setShowcase(info.showcase || false)
            // setMarkedForTrade(info.markedForTrade || false)

            // Build holo patterns
            const items = info?.variants
                ? []
                : [{ label: 'Normal', value: 'normal' }]

            for (const [, holopattern] of Object.entries(
                info?.variants || {}
            )) {
                items.push({
                    label: capitalizeEachWord(holopattern),
                    value: holopattern
                })
            }

            setCardFoils(createListCollection({ items }))
        }

        fetchCardInfo()

        return () => {
            active = false
        }
    }, [id, getCardInformation])

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            CardName: '',
            CardSet: '',
            CardGrade: ['ungraded'],
            CardGradeDetail: [],
            Condition: undefined,
            FoilPattern: undefined,
            Showcase: showcase,
            MarkedForTrade: markedForTrade,
            Tags: []
        }
    })

    // Reset form when cardInfo loads
    useEffect(() => {
        if (cardInfo) {
            reset({
                CardName: cardInfo.name ?? '',
                CardSet: cardInfo.setId ?? '',
                CardGrade: ['ungraded'],
                CardGradeDetail: [],
                Condition: undefined,
                FoilPattern: undefined,
                Showcase: false,
                MarkedForTrade: false,
                Tags: []
            })
        }
    }, [cardInfo, reset])

    // Keep FoilPattern initialized to the first available item.
    useEffect(() => {
        const firstFoil = cardFoils?.items?.[0]?.value
        if (firstFoil) {
            setValue('FoilPattern', firstFoil, { shouldDirty: false })
        }
    }, [cardFoils, setValue])

    // keep track of the currently selected top-level grade so we can
    // enable/disable and populate the second select accordingly
    const [selectedGrade, setSelectedGrade] = useState<string>('ungraded')

    // Keep Condition initialized to the first available item when card is ungraded.
    useEffect(() => {
        if (selectedGrade !== 'ungraded') return

        const firstCondition = conditions.items?.[0]?.value
        if (firstCondition) {
            setValue('Condition', firstCondition, { shouldDirty: false })
        }
    }, [selectedGrade, setValue])

    // memoize the second-select collection items for performance
    const detailOptions = useMemo(
        () => gradeDetailsMap[selectedGrade] ?? [],
        [selectedGrade]
    )

    // Keep CardGradeDetail initialized to the first available number when graded.
    useEffect(() => {
        if (selectedGrade === 'ungraded') {
            setValue('CardGradeDetail', [], { shouldDirty: false })
            return
        }

        const firstDetail = detailOptions[0]?.value
        if (firstDetail) {
            setValue('CardGradeDetail', [firstDetail], { shouldDirty: false })
        }
    }, [selectedGrade, detailOptions, setValue])

    const onSubmit = handleSubmit(async (data) => {
        try {
            if (!session?.user?.id) return // Extra check to ensure user is authenticated before allowing submission
            const payload = {
                cardName: data.CardName,
                condition: data.Condition ?? undefined,
                variant: data.FoilPattern ?? 'normal',
                grade: data.CardGrade?.[0] ?? 'Ungraded',
                gradeLevel: data.CardGradeDetail?.[0] ?? undefined,
                tags: data.Tags ?? [],
                cardId: id || undefined,
                showcase: showcase ?? false,
                markedForTrade: markedForTrade ?? false
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

            alert('Card saved to your collection')
            // Refresh the user data
            refreshPokemonCards(session.user.id)
        } catch (err) {
            console.error('Unexpected error saving card', err)
            alert('Unexpected error saving card')
        }
    })

    if (loading || !session)
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )

    return (
        <form onSubmit={onSubmit}>
            {/* Keep the card image to the left at all screen sizes and the form on the right */}
            <VStack
                direction="row"
                gap="6"
                align="flex-start"
                w="100%"
                flexWrap="nowrap"
                padding={2}
            >
                <PokemonCardHeader cardId={id || ''} />
                <HStack gap={1} width="100%">
                    <Button
                        size="sm"
                        variant="outline"
                        flex="1"
                        // backgroundColor="brand.marigold"
                        // color="brand.turtoise"
                        onClick={() => setShowcase(!showcase)}
                    >
                        {showcase ? (
                            <CombinedIcons
                                icons={[
                                    <FaEye key="eye" />,
                                    <RxCross1 key="cross" />
                                ]}
                            />
                        ) : (
                            <FaEye />
                        )}
                        <Text ml={2}>{showcase ? "Don't" : ''} Showcase</Text>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        flex="1"
                        onClick={() => setMarkedForTrade(!markedForTrade)}
                    >
                        {markedForTrade ? (
                            <CombinedIcons
                                icons={[
                                    <AiOutlineSwap key="swap" />,
                                    <RxCross1 key="cross" />
                                ]}
                            />
                        ) : (
                            <AiOutlineSwap />
                        )}
                        <Text ml={2}>
                            {markedForTrade ? 'Unmark' : 'Mark for'} Trade
                        </Text>
                    </Button>
                </HStack>
                <Controller
                    name="FoilPattern"
                    control={control}
                    render={({ field }) => (
                        <Listbox.Root
                            collection={
                                cardFoils ||
                                createListCollection<{
                                    label: string
                                    value: string
                                }>({ items: [] })
                            }
                            deselectable
                            value={
                                field.value
                                    ? [field.value]
                                    : cardFoils?.items?.[0]?.value
                                      ? [cardFoils.items[0].value]
                                      : []
                            }
                            onValueChange={({ value }) =>
                                field.onChange(value[0] || '')
                            }
                        >
                            <Listbox.Label>Card Foil/Pattern</Listbox.Label>
                            <Listbox.Content>
                                {cardFoils?.items.map((cardFoil) => (
                                    <Listbox.Item
                                        item={cardFoil}
                                        key={cardFoil.value}
                                    >
                                        <Listbox.ItemText>
                                            {cardFoil.label}
                                        </Listbox.ItemText>
                                        <Listbox.ItemIndicator />
                                    </Listbox.Item>
                                ))}
                            </Listbox.Content>
                        </Listbox.Root>
                    )}
                />
                <Field.Root invalid={!!errors.CardGrade}>
                    <Field.Label>Grading</Field.Label>
                    <Controller
                        control={control}
                        name="CardGrade"
                        render={({ field }) => {
                            // single selected value derived from the form's array value
                            const selected = Array.isArray(field.value)
                                ? (field.value[0] ?? 'ungraded')
                                : (field.value ?? 'ungraded')

                            const handleChange = (payload: SelectPayload) => {
                                const raw = payload?.value
                                const arr =
                                    raw === undefined
                                        ? []
                                        : Array.isArray(raw)
                                          ? raw
                                          : [raw]
                                field.onChange(arr)
                                setSelectedGrade(arr[0] ?? 'ungraded')
                            }

                            return (
                                <Select.Root
                                    name={field.name}
                                    value={[selected]}
                                    onValueChange={handleChange}
                                    onInteractOutside={field.onBlur}
                                    collection={grades}
                                    width="100%"
                                >
                                    <Select.HiddenSelect />
                                    <Select.Control
                                        bg="white"
                                        color="black"
                                        style={{
                                            boxSizing: 'border-box',
                                            fontSize: 16
                                        }}
                                    >
                                        <Select.Trigger>
                                            <Select.ValueText />
                                        </Select.Trigger>
                                        <Select.IndicatorGroup>
                                            <Select.Indicator />
                                        </Select.IndicatorGroup>
                                    </Select.Control>
                                    <Portal>
                                        <Select.Positioner>
                                            <Select.Content
                                                style={{
                                                    maxWidth: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                {grades.items.map((grade) => (
                                                    <Select.Item
                                                        item={grade}
                                                        key={grade.value}
                                                        _hover={{
                                                            bg: 'gray.100'
                                                        }}
                                                        _selected={{
                                                            bg: 'black',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {grade.label}
                                                        <Select.ItemIndicator />
                                                    </Select.Item>
                                                ))}
                                            </Select.Content>
                                        </Select.Positioner>
                                    </Portal>
                                </Select.Root>
                            )
                        }}
                    />
                    <Field.ErrorText>
                        {errors.CardGrade?.message}
                    </Field.ErrorText>
                </Field.Root>
                {/* Second select: Grade Detail - disabled when ungraded */}
                {selectedGrade !== 'ungraded' && (
                    <Field.Root invalid={!!errors.CardGradeDetail} width="100%">
                        <Field.Label>Grade Level</Field.Label>
                        <Controller
                            control={control}
                            name="CardGradeDetail"
                            render={({ field }) => {
                                const selected = Array.isArray(field.value)
                                    ? (field.value[0] ?? '')
                                    : (field.value ?? '')

                                const detailCollection = createListCollection({
                                    items: detailOptions
                                })

                                return (
                                    <Select.Root
                                        name={field.name}
                                        collection={detailCollection}
                                        value={
                                            selected
                                                ? [selected]
                                                : detailOptions[0]?.value
                                                  ? [detailOptions[0].value]
                                                  : []
                                        }
                                        onValueChange={(
                                            payload: SelectPayload
                                        ) => {
                                            const raw = payload?.value
                                            const arr =
                                                raw === undefined
                                                    ? []
                                                    : Array.isArray(raw)
                                                      ? raw
                                                      : [raw]
                                            field.onChange(arr)
                                        }}
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control
                                            bg="white"
                                            color="black"
                                            style={{
                                                boxSizing: 'border-box',
                                                fontSize: 16
                                            }}
                                        >
                                            <Select.Trigger>
                                                <Select.ValueText />
                                            </Select.Trigger>
                                            <Select.IndicatorGroup>
                                                <Select.Indicator />
                                            </Select.IndicatorGroup>
                                        </Select.Control>
                                        <Portal>
                                            <Select.Positioner>
                                                <Select.Content>
                                                    {detailOptions.map(
                                                        (opt) => (
                                                            <Select.Item
                                                                key={opt.value}
                                                                item={opt}
                                                                _hover={{
                                                                    bg: 'gray.100'
                                                                }}
                                                                _selected={{
                                                                    bg: 'black',
                                                                    color: 'white'
                                                                }}
                                                            >
                                                                {opt.label}
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        )
                                                    )}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Portal>
                                    </Select.Root>
                                )
                            }}
                        />
                        <Field.ErrorText>
                            {errors.CardGradeDetail?.message}
                        </Field.ErrorText>
                    </Field.Root>
                )}{' '}
                {selectedGrade === 'ungraded' && (
                    <Controller
                        name="Condition"
                        control={control}
                        render={({ field }) => (
                            <Listbox.Root
                                collection={conditions}
                                deselectable
                                width="100%"
                                value={
                                    field.value
                                        ? [field.value]
                                        : conditions.items?.[0]?.value
                                          ? [conditions.items[0].value]
                                          : []
                                }
                                onValueChange={({ value }) =>
                                    field.onChange(value[0] || '')
                                }
                            >
                                <Listbox.Label>Card Condition</Listbox.Label>
                                <Listbox.Content>
                                    {conditions.items.map((condition) => (
                                        <Listbox.Item
                                            item={condition}
                                            key={condition.value}
                                        >
                                            <Listbox.ItemText>
                                                {condition.label}
                                            </Listbox.ItemText>
                                            <Listbox.ItemIndicator />
                                        </Listbox.Item>
                                    ))}
                                </Listbox.Content>
                            </Listbox.Root>
                        )}
                    />
                )}
                <Field.Root>
                    <Controller
                        name="Tags"
                        control={control}
                        render={({ field }) => (
                            <TagsInput.Root
                                name="Tags"
                                value={
                                    Array.isArray(field.value)
                                        ? field.value
                                        : []
                                }
                                onValueChange={(details) => {
                                    field.onChange(details.value)
                                }}
                            >
                                <TagsInput.Label>Tags</TagsInput.Label>
                                {/* Make the tags control and its input use a dark background and light text so they match the other inputs */}
                                <TagsInput.Control
                                    className="tags-control"
                                    style={{
                                        borderRadius: 6,
                                        padding: '6px'
                                    }}
                                >
                                    <TagsInput.Items
                                        style={{ color: 'black' }}
                                    />
                                    <TagsInput.Input
                                        placeholder="Add tag..."
                                        style={{
                                            background: 'transparent',
                                            outline: 'none',
                                            border: 'none'
                                        }}
                                    />
                                </TagsInput.Control>
                                <TagsInput.HiddenInput />
                            </TagsInput.Root>
                        )}
                    />
                    <Field.HelperText>
                        Add your own tags to better categorize your item!
                    </Field.HelperText>
                </Field.Root>
                <HStack direction="column" gap={1} width="100%">
                    <Button bg="red" flex="1" onClick={() => reset()}>
                        Discard Changes
                    </Button>
                    <Button
                        flex="1"
                        backgroundColor="brand.marigold"
                        color="brand.turtoise"
                        type="submit"
                    >
                        Save
                    </Button>
                </HStack>
            </VStack>
        </form>
    )
}

export default EditCardPage
