'use client'
import { Box, Button, Field, Heading, Spinner, VStack } from '@chakra-ui/react'
import { PasswordInput } from '@/components/ui/password-input'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ResetPasswordFormValues } from '@/types/auth'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'

export default function ResetPasswordForm() {
    const { session, loading, signOut } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<ResetPasswordFormValues>({
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    })

    const onSubmit = async (values: ResetPasswordFormValues) => {
        setIsLoading(true)

        // Check if passwords match
        if (values.password !== values.confirmPassword) {
            setError('root', {
                type: 'password_mismatch',
                message: 'Passwords do not match. Please try again.'
            })
            setIsLoading(false)
            return
        }

        // Supabase Auth reset password
        const res = await supabase.auth.updateUser({
            password: values.password
        })

        if (res.error) {
            if (res.error.code === 'weak_password') {
                setError('root', {
                    type: 'weak_password',
                    message:
                        'The password is not valid. It must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
                })
            } else if (res.error.code === 'same_password') {
                setError('root', {
                    type: 'same_password',
                    message:
                        'New password should be different from old password.'
                })
            } else {
                console.error('Error resetting password: ', res.error)
                setError('root', {
                    type: 'reset_error',
                    message:
                        'There was an error sending the password reset email. Please try again later.'
                })
            }
        } else {
            // Password reset successful, redirect to sign-in page
            await signOut()
            router.push('/sign-in')
        }
        setIsLoading(false)
    }

    if (loading || !session) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )
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

                <Heading size="lg">Reset your password</Heading>

                <Field.Root invalid={!!errors.root}>
                    <Field.Root invalid={!!errors.password} required>
                        <Field.Label>
                            New Password <Field.RequiredIndicator />
                        </Field.Label>
                        <PasswordInput
                            {...register('password', {
                                required: 'Password is required'
                            })}
                            variant="subtle"
                            color="black"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                        {errors.password &&
                            errors.password.type === 'required' && (
                                <Field.ErrorText>
                                    {errors.password.message}
                                </Field.ErrorText>
                            )}
                    </Field.Root>

                    <Field.Root invalid={!!errors.confirmPassword} required>
                        <Field.Label>
                            Retype New Password <Field.RequiredIndicator />
                        </Field.Label>
                        <PasswordInput
                            {...register('confirmPassword', {
                                required:
                                    'You have to type the same password again'
                            })}
                            variant="subtle"
                            color="black"
                            placeholder="Re-Enter your password"
                            disabled={isLoading}
                        />
                        {errors.confirmPassword &&
                            errors.confirmPassword.type === 'required' && (
                                <Field.ErrorText>
                                    {errors.confirmPassword.message}
                                </Field.ErrorText>
                            )}
                    </Field.Root>

                    <Field.ErrorText textAlign="center">
                        {errors.root && errors.root.message}
                    </Field.ErrorText>
                </Field.Root>

                <Button
                    backgroundColor="brand.marigold"
                    color="brand.turtoise"
                    width="3/4"
                    type="submit"
                >
                    Reset Password
                </Button>
            </VStack>
        </form>
    )
}
