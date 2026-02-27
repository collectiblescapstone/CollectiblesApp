'use client'
import { Button, Field, Heading, Input, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ForgetPasswordFormValues } from '@/types/auth'
import { supabase } from '@/lib/supabase'
import { baseUrl } from '@/utils/constants'

export default function ForgetPasswordForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<ForgetPasswordFormValues>({
        defaultValues: {
            email: ''
        }
    })

    const onSubmit = async (values: ForgetPasswordFormValues) => {
        setIsLoading(true)

        // Supabase Auth reset password
        const res = await supabase.auth.resetPasswordForEmail(values.email, {
            redirectTo: `${baseUrl}/reset-password`
        })

        if (res.error) {
            setError('root', {
                type: 'reset_error',
                message:
                    'There was an error sending the password reset email. Please try again later.'
            })
        } else {
            setMessage(
                'If an account with that email exists, a password reset link has been sent. Please check your spam folder if you do not see it in your inbox.'
            )
        }
        setIsLoading(false)
    }

    return (
        <form style={{ all: 'inherit' }} onSubmit={handleSubmit(onSubmit)}>
            <VStack
                gap={{ base: '6', lg: '10' }}
                width={{ base: 'full', lg: '1/3' }}
                padding={{ base: '8', lg: '16' }}
            >
                <Heading size="5xl" pb={12}>
                    Kollec {/* LOGO PLACEHOLDER */}
                </Heading>

                <Heading size="lg">Forgot your password?</Heading>

                <Field.Root invalid={!!errors.root}>
                    <Field.Root invalid={!!errors.email} required>
                        <Field.Label>
                            Email <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            {...register('email', {
                                required: 'Email is required'
                            })}
                            variant="subtle"
                            color="black"
                            placeholder="me@example.com"
                            disabled={isLoading}
                        />
                        {errors.email && errors.email.type === 'required' && (
                            <Field.ErrorText>
                                {errors.email.message}
                            </Field.ErrorText>
                        )}

                        <Field.HelperText textAlign="center" color="red.500">
                            {message}
                        </Field.HelperText>
                    </Field.Root>

                    <Field.ErrorText>
                        {errors.root && errors.root.message}
                    </Field.ErrorText>
                </Field.Root>

                <Button
                    backgroundColor="brand.marigold"
                    color="brand.turtoise"
                    width="3/4"
                    type="submit"
                >
                    Send Reset Link
                </Button>
            </VStack>
        </form>
    )
}
