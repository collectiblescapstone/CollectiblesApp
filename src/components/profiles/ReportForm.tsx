'use client'

import { Box, Button, Checkbox, Stack, Text, Textarea } from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { Field } from '@chakra-ui/react'

interface ReportFormValues {
    isVerbalAbuse: boolean
    isSpamming: boolean
    isHarassment: boolean
    isScamming: boolean
    isBadName: boolean
    isBadBio: boolean
    reason: string
}

interface ReportFormProps {
    closeOnSubmit: () => void
}

const checkboxFields: Record<keyof Omit<ReportFormValues, 'reason'>, string> = {
    isVerbalAbuse: 'Verbal Abuse or Offensive Language',
    isSpamming: 'Spamming or Unwanted Messages',
    isHarassment: 'Harassment or Bullying',
    isScamming: 'Scamming or Fraudulent Activity',
    isBadName: 'Inappropriate Name or Username',
    isBadBio: 'Inappropriate Profile Bio'
}

const ReportForm = ({ closeOnSubmit }: ReportFormProps) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setError
    } = useForm<ReportFormValues>({
        defaultValues: {
            isVerbalAbuse: false,
            isSpamming: false,
            isHarassment: false,
            isScamming: false,
            isBadName: false,
            isBadBio: false,
            reason: ''
        }
    })

    const onSubmitHandler = (data: ReportFormValues) => {
        // Validate at least one checkbox is selected
        const hasAtLeastOneCheckbox =
            data.isVerbalAbuse ||
            data.isSpamming ||
            data.isHarassment ||
            data.isScamming ||
            data.isBadName ||
            data.isBadBio

        if (!hasAtLeastOneCheckbox) {
            setError('root', {
                type: 'validation',
                message: 'Please select at least one report type'
            })
            return
        }

        // Close form
        closeOnSubmit()
    }

    return (
        <form
            style={{ all: 'inherit' }}
            onSubmit={handleSubmit(onSubmitHandler)}
        >
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                p={5}
            >
                {/* Checkboxes - Left aligned within centered container */}
                <Stack align="start" gap={3} mb={4} width="100%">
                    {Object.entries(checkboxFields).map(
                        ([fieldName, label]) => (
                            <Controller
                                key={fieldName}
                                name={fieldName as keyof ReportFormValues}
                                control={control}
                                render={({ field }) => (
                                    <Checkbox.Root
                                        checked={Boolean(field.value)}
                                        onCheckedChange={(e) =>
                                            field.onChange(e.checked)
                                        }
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control />
                                        <Checkbox.Label>{label}</Checkbox.Label>
                                    </Checkbox.Root>
                                )}
                            />
                        )
                    )}
                </Stack>

                {/* Reason Textarea */}
                <Box width="100%" mb={2}>
                    <Field.Root invalid={!!errors.reason}>
                        <Field.Label>Reason for Report</Field.Label>
                        <Textarea
                            {...register('reason', {
                                required: 'Reason is required',
                                minLength: {
                                    value: 10,
                                    message:
                                        'Reason must be at least 10 characters'
                                }
                            })}
                            placeholder="Please provide additional details about your report"
                            rows={4}
                        />
                    </Field.Root>
                </Box>

                {/* Error Messages Area */}
                <Box width="100%" mb={3}>
                    {errors.root && (
                        <Text color="red.500" fontSize="sm">
                            {errors.root.message}
                        </Text>
                    )}
                    {errors.reason && (
                        <Text color="red.500" fontSize="sm">
                            {errors.reason.message}
                        </Text>
                    )}
                </Box>

                {/* Action Buttons */}
                <Box display="flex" gap={2}>
                    <Button type="submit" colorScheme="red">
                        Submit Report
                    </Button>
                    <Button onClick={closeOnSubmit} variant="outline">
                        Cancel
                    </Button>
                </Box>
            </Box>
        </form>
    )
}

export default ReportForm
