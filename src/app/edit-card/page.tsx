'use client'

// Capacitor
import { CapacitorHttp } from '@capacitor/core'

// Chakra
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

// Next.js
import { useRouter } from 'next/navigation'

// React
import React, { useMemo, useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash, FaSlash } from 'react-icons/fa'
import { IoSwapVertical } from 'react-icons/io5'

// Next.js
import { useSearchParams } from 'next/navigation'

// Zod
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Child Components
import PopupUI from '@/components/ui/PopupUI'
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

// Form value types
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
    // Use Effect for getting the number of cards that are on showcase
    const [showcaseCount, setShowcaseCount] = useState(0)
    const [showcaseCardIds, setShowcaseCardIds] = useState<string[]>([])

    // Form validation schema
    const formSchema = z.object({
        CardName: z.string().min(1, 'Item name is required'),
        CardSet: z.string().min(1, 'Item set is required'),
        CardGrade: z.array(z.string()).min(1, 'Card Grade is required'),
        CardGradeDetail: z.array(z.string()).optional(),
        Condition: z.string().optional(),
        FoilPattern: z.string().optional(),
        Tags: z.array(z.string()).optional(),
        Showcase: z.boolean(), // Ensure it's a boolean
        MarkedForTrade: z.boolean()
    })
    type SelectPayload = { value?: string | string[] }
    const { getCardInformation } = usePokemonCards()

    // Error display message for if the too many cards on showcase
    const [showcaseError, setShowcaseError] = useState(false)

    const { session, loading } = useAuth()
    const searchParams = useSearchParams()
    const router = useRouter()

    // Showcase and Mark for Trade booleans
    const [showcase, setShowcase] = useState(false)
    const [markedForTrade, setMarkedForTrade] = useState(false)

    const id = searchParams.get('cardId') ?? ''
    const entryId = searchParams.get('entryId') ?? ''

    // Card information
    const [cardInfo, setCardInfo] = useState<PokemonCard | undefined>(undefined)
    const [cardFoils, setCardFoils] =
        useState<ListCollection<{ label: string; value: string }>>()

    useEffect(() => {
        let active = true
        if (!session) return

        const fetchCardInfo = async () => {
            const info = await getCardInformation(id)
            if (!active || !info) return

            setCardInfo(info)

            // Get the number of cards that are on showcase
            const res = await CapacitorHttp.post({
                url: `${baseUrl}/api/collection/showcase`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                }
            })
            setShowcaseCount(res.data.showcaseCount)
            setShowcaseCardIds(
                res.data.data.map((card: { id: string }) => card.id)
            )

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
    }, [id, getCardInformation, session])

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            CardName: cardInfo?.name ?? '',
            CardSet: cardInfo?.setId ?? '',
            CardGrade: ['ungraded'],
            CardGradeDetail: [],
            Condition: undefined,
            FoilPattern: undefined,
            Showcase: showcase,
            MarkedForTrade: markedForTrade,
            Tags: []
        }
    })

    // Reset form when cardInfo loads (only if not editing an existing entry)
    useEffect(() => {
        if (cardInfo && !entryId) {
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
    }, [cardInfo, reset, entryId])

    // Load existing entry data when editing
    useEffect(() => {
        if (!entryId || !session) return

        let active = true

        const loadEntryData = async () => {
            const res = await CapacitorHttp.post({
                url: `${baseUrl}/api/collection/read`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`
                },
                data: JSON.stringify({ cardId: entryId })
            })

            if (!active || !res.data?.data) return

            const entry = res.data.data
            if (process.env.NODE_ENV !== 'production') {
                console.log('Loading entry data:', entry)
            }

            // Set state for showcase and markedForTrade
            setShowcase(entry.showcase ?? false)
            setMarkedForTrade(entry.forTrade ?? false)

            // Extract and set the grade to control UI visibility
            const loadedGrade = entry.grade?.toLowerCase() ?? 'ungraded'
            setSelectedGrade(loadedGrade)

            // Reset form with loaded data
            reset({
                CardName: cardInfo?.name ?? '',
                CardSet: cardInfo?.setId ?? '',
                CardGrade: [loadedGrade],
                CardGradeDetail: entry.gradeLevel ? [entry.gradeLevel] : [],
                Condition: entry.condition ?? undefined,
                FoilPattern: entry.variant ?? undefined,
                Showcase: entry.showcase ?? false,
                MarkedForTrade: entry.forTrade ?? false,
                Tags: entry.tags ?? []
            })
        }

        loadEntryData()

        return () => {
            active = false
        }
    }, [entryId, session, reset, cardInfo])

    // Keep FoilPattern initialized to the first available item (only for new cards).
    useEffect(() => {
        if (entryId) return // Don't auto-initialize when editing

        const firstFoil = cardFoils?.items?.[0]?.value
        if (firstFoil) {
            setValue('FoilPattern', firstFoil, { shouldDirty: false })
        }
    }, [cardFoils, setValue, entryId])

    // keep track of the currently selected top-level grade so we can
    // enable/disable and populate the second select accordingly
    const [selectedGrade, setSelectedGrade] = useState<string>('ungraded')

    // Keep Condition initialized to the first available item when card is ungraded (only for new cards).
    useEffect(() => {
        if (selectedGrade !== 'ungraded' || entryId) return

        const firstCondition = conditions.items?.[0]?.value
        if (firstCondition) {
            setValue('Condition', firstCondition, { shouldDirty: false })
        }
    }, [selectedGrade, setValue, entryId])

    // memoize the second-select collection items for performance
    const detailOptions = useMemo(
        () => gradeDetailsMap[selectedGrade] ?? [],
        [selectedGrade]
    )

    // Keep CardGradeDetail initialized to the first available number when graded (only for new cards).
    useEffect(() => {
        if (selectedGrade === 'ungraded' || entryId) {
            if (selectedGrade === 'ungraded') {
                setValue('CardGradeDetail', [], { shouldDirty: false })
            }
            return
        }

        const firstDetail = detailOptions[0]?.value
        if (firstDetail) {
            setValue('CardGradeDetail', [firstDetail], { shouldDirty: false })
        }
    }, [selectedGrade, detailOptions, setValue, entryId])

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
                entryId: entryId || undefined,
                showcase: showcase ?? false,
                markedForTrade: markedForTrade ?? false
            }

            // PREVENTS ADDING ADDITIONAL SHOWCASE CARDS BEYOND THE LIMIT OF 3
            if (
                showcase &&
                showcaseCount >= 3 &&
                !showcaseCardIds.includes(entryId)
            ) {
                setShowcaseError(true)
                return
            }
            setShowcaseError(false)
            const url = entryId
                ? `${baseUrl}/api/collection/edit`
                : `${baseUrl}/api/collection/save`
            const res = await CapacitorHttp.post({
                url: url,
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

            // Refresh the user data
            refreshPokemonCards(session.user.id)

            const closeAndRedirect = () => {
                PopupUI.close('save-confirmation')
                // Redirect to the userCards page if coming from there, otherwise go to userCards
                // PREVENTS DOUBLE BACK BUTTON ISSUES!
                const referrer = document.referrer
                if (referrer.includes('/user-cards')) {
                    router.back()
                } else {
                    router.replace('/user-cards?cardId=' + id)
                }
            }

            // Show success popup - moved inside the success block
            PopupUI.open('save-confirmation', {
                title: 'Card Saved!',
                content: (
                    <VStack gap={2}>
                        <Text>
                            Your card has been saved to your collection!
                        </Text>
                        <HStack gap={2} width="100%">
                            <Button
                                onClick={closeAndRedirect}
                                background="black"
                            >
                                OK
                            </Button>
                        </HStack>
                    </VStack>
                ),
                onClickClose: closeAndRedirect
            })
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
                        onClick={() => {
                            const nextShowcase = !showcase
                            setShowcase(nextShowcase)
                            if (!nextShowcase) {
                                setShowcaseError(false)
                            }
                        }}
                    >
                        {showcase ? <FaEyeSlash /> : <FaEye />}
                        <Text ml={2}>{showcase ? "Don't" : ''} Showcase</Text>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        flex="1"
                        onClick={() => setMarkedForTrade(!markedForTrade)}
                    >
                        {markedForTrade ? <FaSlash /> : <IoSwapVertical />}
                        <Text ml={2}>
                            {markedForTrade ? 'Unmark' : 'Mark for'} Trade
                        </Text>
                    </Button>
                </HStack>
                {/*ADD ERROR MESSAGE*/}
                {showcaseError && (
                    <Text color="red">
                        You can only have 3 cards showcased at a time.
                    </Text>
                )}
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
                    <Button bg="red" flex="1" onClick={() => router.back()}>
                        Cancel
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
            <PopupUI.Viewport />
        </form>
    )
}

export default EditCardPage
