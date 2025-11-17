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
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

interface FormValues {
    ItemName: string
    ItemSet: string
    CardGrade: string[]
    CardGradeDetail?: string[]
}

const formSchema = z.object({
    ItemName: z.string().min(1, "Item name is required"),
    ItemSet: z.string().min(1, "Item set is required"),
    CardGrade: z.array(z.string()).min(1, "Card Grade is required"),
    CardGradeDetail: z.array(z.string()).optional(),
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

const Demo = () => {
    const {
        register,
        handleSubmit,
        control,
        watch,
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
            <Stack direction="row" gap="6" align="flex-start" w="100%" flexWrap="nowrap">
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
                    <Stack direction="column" spacing={2} width="170px">
                        <Button size="sm" variant="outline">Add to Showcase</Button>
                        <Button size="sm" variant="ghost">Mark For Trade</Button>
                        {/* placeholder for any other quick buttons you want under the card */}
                    </Stack>
                </Box>

                {/* Right: form fields stacked vertically; take remaining width */}
                <Stack as="div" gap="4" align="flex-start" flexGrow={1} minWidth={0}>
                    <Field.Root invalid={!!errors.ItemName}>
                        <Field.Label>
                            Card name <Field.RequiredIndicator/>
                        </Field.Label>
                        <Input
                            placeholder="Item name"
                            {...register("ItemName", { required: "Item name is required" })}
                        />
                        <Field.ErrorText>{errors.ItemName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.ItemSet}>
                        <Field.Label>
                            Card set <Field.RequiredIndicator/>
                        </Field.Label>
                        <Input
                            placeholder="Item set"
                            {...register("ItemSet", { required: "Item set is required" })}
                        />
                        <Field.ErrorText>{errors.ItemSet?.message}</Field.ErrorText>
                    </Field.Root>

                    {/* Keep the two selects small and side-by-side on all screen sizes */}
                    <Stack direction="row" gap="3" align="flex-start" wrap="nowrap">
                        <Field.Root invalid={!!errors.CardGrade} width="150px">
                            <Field.Label>Card Grade</Field.Label>
                            <Controller
                                control={control}
                                name="CardGrade"
                                defaultValue={["ungraded"]}
                                render={({ field }) => {
                                    // The form field stores an array (for compatibility), but the UI Select
                                    // expects a single selected value. Extract the first item to display.
                                    const currentValue: string[] = Array.isArray(field.value)
                                        ? field.value
                                        : [(field.value as string | undefined) ?? "ungraded"]
                                    const selectedValue = currentValue[0] ?? 'ungraded'

                                    return (
                                        // Control the Select directly from the form field value (array), so visual
                                        // selection is always in sync with form state.
                                        <Select.Root
                                            name={field.name}
                                            width="150px"
                                            value={Array.isArray(field.value) ? field.value : [field.value ?? selectedValue]}
                                            onValueChange={(payload) => {
                                                // payload.value will be an array of selected values; keep it as-is for the form
                                                const raw = (payload as any).value
                                                const arr = Array.isArray(raw) ? raw : [raw]
                                                // debug log for troubleshooting
                                                console.log('Select change payload:', payload, 'asArray:', arr)
                                                // update the form field with the array the Select uses
                                                field.onChange(arr)
                                                // update local state so the second select can respond
                                                setSelectedGrade(arr[0])
                                            }}
                                            onInteractOutside={() => field.onBlur()}
                                            collection={grades}
                                        >
                                            <Select.HiddenSelect />
                                            {/* ensure the control uses a white background and black text and a fixed width so it doesn't expand */}
                                            <Select.Control bg="white" color="black" style={{ width: 150, boxSizing: 'border-box' }}>
                                                <Select.Trigger>
                                                    <Select.ValueText style={{ color: 'black', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }} placeholder="Select card grade" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    {/* constrain dropdown width so it matches the control */}
                                                    <Select.Content style={{ width: 150, maxWidth: '100%', boxSizing: 'border-box' }}>
                                                        {grades.items.map((grade) => (
                                                            <Select.Item
                                                                item={grade}
                                                                key={grade.value}
                                                                _hover={{ bg: 'gray.100' }}
                                                                _selected={{ bg: 'black', color: 'white' }}
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
                            <Field.ErrorText>{errors.CardGrade?.message}</Field.ErrorText>
                        </Field.Root>

                        {/* Second select: Grade Detail - disabled when ungraded */}
                        <Field.Root invalid={!!errors.CardGradeDetail} width="150px">
                            <Field.Label>Grade detail</Field.Label>
                            <Controller
                                control={control}
                                name="CardGradeDetail"
                                defaultValue={[]}
                                render={({ field }) => {
                                    // while the form stores an array, the UI is a single-select
                                    const currentValue: string[] = Array.isArray(field.value)
                                        ? field.value
                                        : [(field.value as string | undefined) ?? ""]

                                    // If the top-level grade is ungraded, keep the second select disabled
                                    const disabled = selectedGrade === 'ungraded' || detailOptions.length === 0

                                    // create a collection for the project's Select when enabled
                                    const detailCollection = createListCollection({ items: detailOptions })

                                    if (disabled) {
                                        // Disabled: render a native select for predictable behaviour
                                        return (
                                            <select
                                                name={field.name}
                                                value={currentValue[0] ?? ''}
                                                onChange={(e) => field.onChange([e.target.value])}
                                                onBlur={field.onBlur}
                                                disabled
                                                style={{
                                                    width: '100%',
                                                    maxWidth: 150,
                                                    padding: '8px 10px',
                                                    borderRadius: 6,
                                                    background: '#f0f0f0',
                                                    border: '1px solid #ccc',
                                                    color: '#666',
                                                    boxSizing: 'border-box',
                                                }}
                                            >
                                                <option value="" disabled>Disabled</option>
                                            </select>
                                        )
                                    }

                                    // Enabled: use the project's Select component to match CardGrade visuals and dropdown sizing
                                    return (
                                        <Select.Root
                                            name={field.name}
                                            collection={detailCollection}
                                            width="150px" // keep width consistent with CardGrade control
                                            // control using the form field's array value
                                            value={Array.isArray(field.value) ? field.value : [field.value ?? '']}
                                            onValueChange={(payload) => {
                                                const raw = (payload as any).value
                                                const arr = Array.isArray(raw) ? raw : [raw]
                                                field.onChange(arr)
                                            }}
                                        >
                                            <Select.HiddenSelect />
                                            <Select.Control bg="white" color="black" style={{ width: 150, boxSizing: 'border-box' }}>
                                                <Select.Trigger>
                                                    <Select.ValueText style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }} placeholder="Select detail" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    {/* constrain dropdown width to match control */}
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

                     <Field.Root>
                         <TagsInput.Root name="tags">
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
                        <Field.HelperText>
                            Add your own tags to better categorize your item!
                        </Field.HelperText>
                    </Field.Root>
                    <Button type="submit">Save</Button>
                </Stack>
            </Stack>
        </form>
    )
}

export default Demo
