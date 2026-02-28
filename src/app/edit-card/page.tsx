'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    Button,
    Field,
    Stack,
    TagsInput,
    Image,
    Select,
    Portal,
    Box,
    createListCollection,
    Listbox,
    Spinner,
    ListCollection
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { CapacitorHttp } from '@capacitor/core'

// Context
import { useAuth } from '@/context/AuthProvider'

// Utils
import { baseUrl } from '@/utils/constants'
import { cardConditions, gradeDetailsMap, gradingCompanies } from '@/utils/cardInfo/cardGrading'
import { capitalizeEachWord } from '@/utils/capitalize'
import { getCardInformation, PokemonCard } from '@/utils/pokemonCard'
import { refreshPokemonCards } from '@/utils/userPokemonCard'
import { getSetName } from '@/utils/pokemonSet'


interface FormValues {
    CardName: string
    CardSet: string
    CardGrade: string[]
    CardGradeDetail?: string[]
    Condition?: string
    FoilPattern?: string
    Tags?: string[]
}

const formSchema = z.object({
    CardName: z.string().min(1, 'Item name is required'),
    CardSet: z.string().min(1, 'Item set is required'),
    CardGrade: z.array(z.string()).min(1, 'Card Grade is required'),
    CardGradeDetail: z.array(z.string()).optional(),
    Condition: z.string().optional(),
    FoilPattern: z.string().optional(),
    Tags: z.array(z.string()).optional()
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

    const { session, loading } = useAuth()
    const searchParams = useSearchParams()

    // Card information
    const [cardId, setCardId] = useState<string>('')
    const [cardInfo, setCardInfo] = useState<PokemonCard | undefined>(undefined)
    const [cardFoils, setCardFoils] = useState<ListCollection<{ label: string; value: string; }>>()
    const [cardSet, setCardSet] = useState<string>('')


    useEffect(() => {
        const cardId = searchParams.get('cardId') ?? ''
        setCardId(cardId)
        const fetchCardInfo = async () => {
            const info = await getCardInformation(cardId)
            setCardInfo(info)

            setCardSet(await getSetName(info?.setId ?? '') || 'N/A')

            // Get holo patterns
            const items = info?.variants ? [] : [{ label: 'Normal', value: 'normal' }]

            for (const [, holopattern] of Object.entries(info?.variants || {})) {
                console.log(holopattern)
                items.push({
                    label: capitalizeEachWord(holopattern),
                    value: holopattern
                })
            }
            setCardFoils(createListCollection({
                items: items
            }))
        }
        fetchCardInfo()
    }, [searchParams])


    const {
        handleSubmit,
        control,
        reset,
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
                Tags: []
            })
        }
    }, [cardInfo, reset])



    // keep track of the currently selected top-level grade so we can
    // enable/disable and populate the second select accordingly
    const [selectedGrade, setSelectedGrade] = useState<string>('ungraded')

    // memoize the second-select collection items for performance
    const detailOptions = useMemo(
        () => gradeDetailsMap[selectedGrade] ?? [],
        [selectedGrade]
    )

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
                cardId: cardId || undefined
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

    if (!session?.user?.id) return

    if (loading || !session) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )
    }


    return (
        <form onSubmit={onSubmit}>
            {/* Keep the card image to the left at all screen sizes and the form on the right */}
            <Stack
                direction="row"
                gap="6"
                align="flex-start"
                w="100%"
                flexWrap="nowrap"
                p={2}
            >
                {/* Left column: card image (playing-card shape) with buttons underneath */}
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={3}
                >
                    {/* Playing-card shaped preview */}
                    <Box
                        bg="tomato"
                        width="170px"
                        borderRadius="12px"
                        boxShadow="md"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        style={{
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <Image
                            src={
                                cardInfo?.image_url !== 'undefined/low.png' && cardInfo?.image_url !== ''
                                    ? cardInfo?.image_url
                                    : '/Images/PokemonCardBack.jpg'
                            }
                            alt={cardInfo?.name ?? 'Card Image'}
                            objectFit="contain"
                            width="100%"
                        />
                    </Box>

                    {/* Buttons under the card image for quick actions */}
                    <Stack direction="column" gap={2} width="170px">
                        <Button size="sm" variant="outline">
                            Add to Showcase
                        </Button>
                        <Button size="sm" variant="outline">
                            Mark For Trade
                        </Button>
                    </Stack>
                </Box>

                {/* Right: form fields stacked vertically; take remaining width */}
                <Stack
                    as="div"
                    gap="4"
                    align="flex-start"
                    flexGrow={1}
                    minWidth={0}
                >
                    <Box fontSize="sm" fontWeight="bold">Card name</Box>
                    <Box>{cardInfo?.name || 'N/A'}</Box>

                    <Box fontSize="sm" fontWeight="bold">Card set</Box>
                    {/* getSetName(cardInfo?.setId || '') */}
                    <Box>{cardSet}</Box>

                    <Stack
                        direction="row"
                        gap="3"
                        align="flex-start"
                        wrap="nowrap"
                        width="-webkit-fill-available"
                    >
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

                                    const handleChange = (
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
                                        setSelectedGrade(arr[0] ?? 'ungraded')
                                    }

                                    return (
                                        <Select.Root
                                            name={field.name}
                                            value={[selected]}
                                            onValueChange={handleChange}
                                            onInteractOutside={field.onBlur}
                                            collection={grades}
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
                                                    <Select.ValueText
                                                        style={{
                                                            maxWidth: 120,
                                                            whiteSpace:
                                                                'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis'
                                                        }}
                                                        placeholder="Select card grade"
                                                    />
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
                                                            boxSizing:
                                                                'border-box'
                                                        }}
                                                    >
                                                        {grades.items.map(
                                                            (grade) => (
                                                                <Select.Item
                                                                    item={grade}
                                                                    key={
                                                                        grade.value
                                                                    }
                                                                    _hover={{
                                                                        bg: 'gray.100'
                                                                    }}
                                                                    _selected={{
                                                                        bg: 'black',
                                                                        color: 'white'
                                                                    }}
                                                                >
                                                                    {
                                                                        grade.label
                                                                    }
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
                                {errors.CardGrade?.message}
                            </Field.ErrorText>
                        </Field.Root>

                        {/* Second select: Grade Detail - disabled when ungraded */}
                        <Field.Root
                            invalid={!!errors.CardGradeDetail}
                            width="50px"
                        >
                            <Field.Label>Number</Field.Label>
                            <Controller
                                control={control}
                                name="CardGradeDetail"
                                render={({ field }) => {
                                    const selected = Array.isArray(field.value)
                                        ? (field.value[0] ?? '')
                                        : (field.value ?? '')
                                    const disabled =
                                        selectedGrade === 'ungraded' ||
                                        detailOptions.length === 0

                                    if (disabled) {
                                        return (
                                            <select
                                                name={field.name}
                                                value={selected}
                                                onChange={(e) =>
                                                    field.onChange([
                                                        e.target.value
                                                    ])
                                                }
                                                onBlur={field.onBlur}
                                                disabled
                                                style={{
                                                    width: '100%',
                                                    maxWidth: 50,
                                                    padding: '8px 10px',
                                                    borderRadius: 6,
                                                    background: '#f0f0f0',
                                                    border: '1px solid #ccc',
                                                    color: '#666',
                                                    fontSize: 16,
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                <option
                                                    value=""
                                                    disabled
                                                ></option>
                                            </select>
                                        )
                                    }

                                    const detailCollection =
                                        createListCollection({
                                            items: detailOptions
                                        })

                                    return (
                                        <Select.Root
                                            name={field.name}
                                            collection={detailCollection}
                                            value={[selected]}
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
                                                    width: 50,
                                                    boxSizing: 'border-box',
                                                    fontSize: 16
                                                }}
                                            >
                                                <Select.Trigger>
                                                    <Select.ValueText
                                                        style={{
                                                            maxWidth: 50,
                                                            whiteSpace:
                                                                'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis'
                                                        }}
                                                        placeholder="#"
                                                    />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    <Select.Content
                                                        style={{
                                                            width: 150,
                                                            maxWidth: '100%',
                                                            boxSizing:
                                                                'border-box'
                                                        }}
                                                    >
                                                        {detailOptions.map(
                                                            (opt) => (
                                                                <Select.Item
                                                                    key={
                                                                        opt.value
                                                                    }
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
                    </Stack>

                    <Controller
                        name="Condition"
                        control={control}
                        render={({ field }) => (
                            <Listbox.Root
                                collection={conditions}
                                deselectable
                                maxW="320px"
                                value={field.value ? [field.value] : []}
                                onValueChange={({ value }) =>
                                    field.onChange(value[0] || '')
                                }
                            >
                                <Listbox.Label>Card condition</Listbox.Label>
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

                    <Controller
                        name="FoilPattern"
                        control={control}
                        render={({ field }) => (
                            <Listbox.Root
                                collection={cardFoils || createListCollection<{ label: string; value: string }>({ items: [] })}
                                deselectable
                                maxW="320px"
                                value={field.value ? [field.value] : []}
                                onValueChange={({ value }) =>
                                    field.onChange(value[0] || '')
                                }
                            >
                                <Listbox.Label>Card Foil Pattern</Listbox.Label>
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
                    <Stack direction="column" gap={2}>
                        <Button bg="red" onClick={() => reset()}>
                            Discard Changes
                        </Button>
                        <Button type="submit">Save</Button>
                    </Stack>
                </Stack>
            </Stack>
        </form>
    )
}

export default EditCardPage
