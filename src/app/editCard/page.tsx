'use client';

import React, { useMemo, useState } from 'react';

import {
    Button,
    Field,
    Input,
    Stack,
    TagsInput,
    Select,
    Portal,
    Box,
    createListCollection,
    Listbox,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

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
    CardName: z.string().min(1, "Item name is required"),
    CardSet: z.string().min(1, "Item set is required"),
    CardGrade: z.array(z.string()).min(1, "Card Grade is required"),
    CardGradeDetail: z.array(z.string()).optional(),
    Condition: z.string().optional(),
    FoilPattern: z.string().optional(),
    Tags: z.array(z.string()).optional(),
})

const grades = createListCollection({
    items: [
        { label: "Ungraded", value: "ungraded" },
        { label: "PSA", value: "psa" },
        { label: "TAG", value: "tag" },
        { label: "CGC", value: "cgc" },
        { label: "Beckett", value: "beckett" },
        { label: "ACE", value: "ace" },
    ],
})

// Mapping for the second select's options depending on the selected grade
const gradeDetailsMap: Record<string, { label: string; value: string }[]> = {
    ungraded: [],
    psa: [
        { label: '10', value: 'psa-10' },
        { label: '9', value: 'psa-9' },
        { label: '8', value: 'psa-8' },
    ],
    tag: [
        { label: '10', value: 'tag-10' },
        { label: '9', value: 'tag-9' },
    ],
    cgc: [
        { label: '10', value: 'cgc-10' },
        { label: '9.5', value: 'cgc-9.5' },
    ],
    beckett: [
        { label: '10', value: 'beckett-10' },
    ],
    ace: [
        { label: '10', value: 'ace-10' },
    ],
}

const conditions = createListCollection({
    items: [
        { label: "Near Mint", value: "near-mint" },
        { label: "Lightly Played", value: "lightly-played" },
        { label: "Moderately Played", value: "moderately-played" },
        { label: "Heavily Played", value: "heavily-played" },
        { label: "Damaged", value: "damaged" },
    ],
})

const foils = createListCollection({
    items: [
        { label: "Starlight", value: "starlight" },
        { label: "Cosmos", value: "cosmos" },
        { label: "Tinsel", value: "tinsel" },
        { label: "Sheen", value: "sheen" },
        { label: "Cracked Ice", value: "cracked-ice" },
        { label: "Crosshatch", value: "crosshatch" },
        { label: "Water Web", value: "water-web" },
        { label: "Sequin", value: "sequin" },
        { label: "Pixel", value: "pixel" },
        { label: "Reverse Holofoil", value: "reverse-holo" },
    ],
})

function reset() {
    // Placeholder reset function - implement form reset logic as needed
    console.log('Reset form called')
}

const Demo = () => {
    type SelectPayload = { value?: string | string[] }

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    })

    // keep track of the currently selected top-level grade so we can
    // enable/disable and populate the second select accordingly
    const [selectedGrade, setSelectedGrade] = useState<string>('ungraded')

    // memoize the second-select collection items for performance
    const detailOptions = useMemo(() => gradeDetailsMap[selectedGrade] ?? [], [selectedGrade])

    const onSubmit = handleSubmit((data) => console.log(data))

    return (
        <form onSubmit={onSubmit}>
            {/* Keep the card image to the left at all screen sizes and the form on the right */}
            <Stack direction="row" gap="6" align="flex-start" w="100%" flexWrap="nowrap" p={2}>
                {/* Left column: card image (playing-card shape) with buttons underneath */}
                <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
                    {/* Playing-card shaped preview */}
                    <Box
                        bg="tomato"
                        width="170px"
                        height="260px"
                        borderRadius="12px"
                        boxShadow="md"
                        p="4"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        CARD IMAGE
                    </Box>

                    {/* Buttons under the card image for quick actions */}
                    <Stack direction="column" gap={2} width="170px">
                        <Button size="sm" variant="outline">Add to Showcase</Button>
                        <Button size="sm" variant="outline">Mark For Trade</Button>
                    </Stack>
                </Box>

                {/* Right: form fields stacked vertically; take remaining width */}
                <Stack as="div" gap="4" align="flex-start" flexGrow={1} minWidth={0}>
                    <Field.Root invalid={!!errors.CardName}>
                        <Field.Label>
                            Card name <Field.RequiredIndicator/>
                        </Field.Label>
                        <Input
                            placeholder="Item name"
                            {...register("CardName", { required: "Card name is required" })}
                        />
                        <Field.ErrorText>{errors.CardName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.CardSet}>
                        <Field.Label>
                            Card set <Field.RequiredIndicator/>
                        </Field.Label>
                        <Input
                            placeholder="Item set"
                            {...register("CardSet", { required: "Card set is required" })}
                        />
                        <Field.ErrorText>{errors.CardSet?.message}</Field.ErrorText>
                    </Field.Root>

                    <Stack direction="row" gap="3" align="flex-start" wrap="nowrap">
                        <Field.Root invalid={!!errors.CardGrade} width="150px">
                            <Field.Label>Card Grade</Field.Label>
                            <Controller
                                control={control}
                                name="CardGrade"
                                defaultValue={["ungraded"]}
                                render={({ field }) => {
                                    // single selected value derived from the form's array value
                                    const selected = Array.isArray(field.value) ? (field.value[0] ?? 'ungraded') : (field.value ?? 'ungraded')

                                    const handleChange = (payload: SelectPayload) => {
                                        const raw = payload?.value
                                        const arr = raw === undefined ? [] : (Array.isArray(raw) ? raw : [raw])
                                        field.onChange(arr)
                                        setSelectedGrade(arr[0] ?? 'ungraded')
                                    }

                                    return (
                                        <Select.Root
                                            name={field.name}
                                            width="150px"
                                            value={[selected]}
                                            onValueChange={handleChange}
                                            onInteractOutside={field.onBlur}
                                            collection={grades}
                                        >
                                            <Select.HiddenSelect />
                                            <Select.Control bg="white" color="black" style={{ width: 150, boxSizing: 'border-box', fontSize: 16 }}>
                                                <Select.Trigger>
                                                    <Select.ValueText style={{ maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} placeholder="Select card grade" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    <Select.Content style={{ width: 150, maxWidth: '100%', boxSizing: 'border-box' }}>
                                                        {grades.items.map((grade) => (
                                                            <Select.Item item={grade} key={grade.value} _hover={{ bg: 'gray.100' }} _selected={{ bg: 'black', color: 'white' }}>
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
                            <Field.ErrorText>{errors.CardGrade?.message}</Field.ErrorText>
                        </Field.Root>

                        {/* Second select: Grade Detail - disabled when ungraded */}
                        <Field.Root invalid={!!errors.CardGradeDetail} width="50px">
                            <Field.Label>Number</Field.Label>
                            <Controller
                                control={control}
                                name="CardGradeDetail"
                                defaultValue={[]}
                                render={({ field }) => {
                                    const selected = Array.isArray(field.value) ? (field.value[0] ?? '') : (field.value ?? '')
                                    const disabled = selectedGrade === 'ungraded' || detailOptions.length === 0

                                    if (disabled) {
                                        return (
                                            <select
                                                name={field.name}
                                                value={selected}
                                                onChange={(e) => field.onChange([e.target.value])}
                                                onBlur={field.onBlur}
                                                disabled
                                                style={{ width: '100%', maxWidth: 50, padding: '8px 10px', borderRadius: 6, background: '#f0f0f0', border: '1px solid #ccc', color: '#666', fontSize: 16, boxSizing: 'border-box' }}
                                            >
                                                <option value="" disabled></option>
                                            </select>
                                        )
                                    }

                                    const detailCollection = createListCollection({ items: detailOptions })

                                    return (
                                        <Select.Root
                                            name={field.name}
                                            collection={detailCollection}
                                            value={[selected]}
                                            onValueChange={(payload: SelectPayload) => {
                                                const raw = payload?.value
                                                const arr = raw === undefined ? [] : (Array.isArray(raw) ? raw : [raw])
                                                field.onChange(arr)
                                            }}
                                        >
                                            <Select.HiddenSelect />
                                            <Select.Control bg="white" color="black" style={{ width: 50, boxSizing: 'border-box', fontSize: 16 }}>
                                                <Select.Trigger>
                                                    <Select.ValueText style={{ maxWidth: 50, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} placeholder="#" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    <Select.Content style={{ width: 150, maxWidth: '100%', boxSizing: 'border-box' }}>
                                                        {detailOptions.map((opt) => (
                                                            <Select.Item key={opt.value} item={opt} _hover={{ bg: 'gray.100' }} _selected={{ bg: 'black', color: 'white' }}>
                                                                {opt.label}
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
                            <Field.ErrorText>{errors.CardGradeDetail?.message}</Field.ErrorText>
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
                                onValueChange={({ value }) => field.onChange(value[0] || "")}
                            >
                                <Listbox.Label>Card condition</Listbox.Label>
                                <Listbox.Content>
                                    {conditions.items.map((condition) => (
                                        <Listbox.Item item={condition} key={condition.value}>
                                            <Listbox.ItemText>{condition.label}</Listbox.ItemText>
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
                                collection={foils}
                                deselectable
                                maxW="320px"
                                value={field.value ? [field.value] : []}
                                onValueChange={({ value }) => field.onChange(value[0] || "")}
                            >
                                <Listbox.Label>Card Foil Pattern</Listbox.Label>
                                <Listbox.Content>
                                    {foils.items.map((foil) => (
                                        <Listbox.Item item={foil} key={foil.value}>
                                            <Listbox.ItemText>{foil.label}</Listbox.ItemText>
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
                                     value={field.value || []}
                                     onChange={field.onChange}
                                 >
                                     <TagsInput.Label>Tags</TagsInput.Label>
                                     {/* Make the tags control and its input use a dark background and light text so they match the other inputs */}
                                     <TagsInput.Control className="tags-control" style={{borderRadius: 6, padding: '6px' }}>
                                         <TagsInput.Items style={{color:'black'}}/>
                                         <TagsInput.Input
                                             placeholder="Add tag..."
                                             style={{ background: 'transparent', outline: 'none', border: 'none' }}
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
                    <Stack direction="row" gap={2}>
                        <Button bg="red" onClick={reset}>Discard Changes</Button>
                        <Button type="submit">Save</Button>
                    </Stack>
                </Stack>
            </Stack>
        </form>
    )
}

export default Demo
