'use client';

import {
    Button,
    Field,
    Input,
    Stack,
    TagsInput,
    Box,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"

interface FormValues {
    ItemName: string
    ItemSet: string
}


const Demo = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>()

    const onSubmit = handleSubmit((data) => console.log(data))

    return (
        <form onSubmit={onSubmit}>
            {/* Use a responsive Stack so the image box and the form fields sit side-by-side on md+ screens */}
            <Stack direction={{ base: 'column', md: 'row' }} gap="6" align="flex-start" w="100%">
                {/* Left: image / preview box */}
                <Box bg="tomato" w={{ base: '100%', md: '40%' }} p="4" color="white" borderRadius="md">
                    PRETEND THIS IS THE CARD IMAGE :3
                </Box>

                {/* Right: form fields stacked vertically; take remaining width */}
                <Stack as="div" gap="4" align="flex-start" w={{ base: '100%', md: '60%' }}>
                    <Field.Root invalid={!!errors.ItemName}>
                        <Field.Label>Item name</Field.Label>
                        <Input
                            placeholder="Item name"
                            {...register("ItemName", { required: "Item name is required" })}
                        />
                        <Field.ErrorText>{errors.ItemName?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.ItemSet}>
                        <Field.Label>Item set</Field.Label>
                        <Input
                            placeholder="Item set"
                            {...register("ItemSet", { required: "Item set is required" })}
                        />
                        <Field.ErrorText>{errors.ItemSet?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root>
                        <TagsInput.Root name="tags">
                            <TagsInput.Label>Tags</TagsInput.Label>
                            {/* Make the tags control and its input use a dark background and light text so they match the other inputs */}
                            <TagsInput.Control className="tags-control" style={{ background: 'black', color: 'white', borderRadius: 6, padding: '6px' }}>
                                <TagsInput.Items style={{color:'black'}}/>
                                <TagsInput.Input
                                    placeholder="Add tag..."
                                    style={{ background: 'transparent', color: 'white', outline: 'none', border: 'none' }}
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
