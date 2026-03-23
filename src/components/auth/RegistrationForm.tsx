'use client'

// React
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

// Next.js
import { useRouter } from 'next/navigation'

// Chakra UI
import { Button, Field, Heading, Input, VStack } from '@chakra-ui/react'

// Capacitor
import { CapacitorHttp } from '@capacitor/core'

// Child Components
import { PasswordInput } from '@/components/ui/password-input'
import TitleLogo from '@/components/auth/TitleLogo'

// Context
import { useAuth } from '@/context/AuthProvider'

// Utils
import { baseUrl } from '@/utils/constants'
import { profanityChecker } from '@/utils/profanityCheck'

// Types
import { SignupFormValues } from '@/types/auth'

const RegistrationForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { signUp } = useAuth()
    const { push } = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<SignupFormValues>({
        defaultValues: {
            firstName: '',
            lastName: '',
            username: '',
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    })

    const onSubmit = async (values: SignupFormValues) => {
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

        // Check if username is valid (alphanumeric and underscores only)
        const usernameRegex = /^[a-z0-9_]+$/
        if (!usernameRegex.test(values.username.trim())) {
            setError('root', {
                type: 'invalid_username',
                message:
                    'Username can only contain lowercase letters, numbers, and underscores. Please choose a different username.'
            })
            setIsLoading(false)
            return
        }

        // Check if any of the fields contain profanity
        const fieldsToCheck = [
            {
                value: values.firstName,
                name: 'firstName' as const
            },
            {
                value: values.lastName,
                name: 'lastName' as const
            },
            {
                value: values.username,
                name: 'username' as const
            }
        ]

        for (const field of fieldsToCheck) {
            if (profanityChecker(field.value)) {
                setError(field.name, {
                    type: 'profanity',
                    message: 'Please remove profanity from this field.'
                })
                setIsLoading(false)
                return
            }
        }

        // Supabase Auth sign up user
        const res = await signUp(values.email, values.password)

        // Handle Supabase Auth successful sign up
        if (res.success) {
            // Call API to register user in database
            const response = await CapacitorHttp.post({
                url: `${baseUrl}/api/register-user`,
                headers: { 'Content-Type': 'application/json' },
                data: {
                    id: res.data.user?.id,
                    email: values.email,
                    username: values.username.trim(),
                    firstName: values.firstName,
                    lastName: values.lastName
                }
            }).then((res) => res.data)

            // Check for username uniqueness error
            if (response.error && response.error.code === 'P2002') {
                setError('root', {
                    type: 'username_taken',
                    message:
                        'An account with this username already exists. Please pick a different username.'
                })
            } else {
                push('/sign-in')
            }
        }

        // Handle errors from Supabase Auth Sign Up
        else if (res.error) {
            if (res.error.code === 'user_already_exists') {
                setError('root', {
                    type: 'user_already_exists',
                    message:
                        'An account with this email already exists. Please sign in or reset your password.'
                })
            } else if (res.error.code === 'weak_password') {
                setError('root', {
                    type: 'weak_password',
                    message:
                        'The password is not valid. It must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
                })
            } else {
                setError('root', {
                    type: 'unknown_error',
                    message: 'An unexpected error occurred. Please try again.'
                })
            }
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
                <TitleLogo />

                <Heading size="lg">Sign Up for an account</Heading>

                <Field.Root invalid={!!errors.root}>
                    <Field.Root invalid={!!errors.email} required>
                        <Field.Label>
                            Email <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            {...register('email', {
                                required: 'Email is required'
                            })}
                            fontSize="md"
                            variant="subtle"
                            color="black"
                            placeholder="Enter your username or email"
                            disabled={isLoading}
                        />
                        {errors.email && errors.email.type === 'required' && (
                            <Field.ErrorText>
                                {errors.email.message}
                            </Field.ErrorText>
                        )}
                    </Field.Root>

                    <Field.Root invalid={!!errors.username} required>
                        <Field.Label>
                            Username <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            {...register('username', {
                                required: 'Username is required'
                            })}
                            fontSize="md"
                            variant="subtle"
                            color="black"
                            placeholder="my_username"
                            disabled={isLoading}
                        />
                        {errors.username && (
                            <Field.ErrorText>
                                {errors.username.message}
                            </Field.ErrorText>
                        )}
                    </Field.Root>

                    <Field.Root invalid={!!errors.firstName}>
                        <Field.Label>First Name</Field.Label>
                        <Input
                            {...register('firstName')}
                            fontSize="md"
                            variant="subtle"
                            color="black"
                            placeholder="First Name"
                            disabled={isLoading}
                        />
                        {errors.firstName && (
                            <Field.ErrorText>
                                {errors.firstName.message}
                            </Field.ErrorText>
                        )}
                    </Field.Root>

                    <Field.Root invalid={!!errors.lastName}>
                        <Field.Label>Last Name</Field.Label>
                        <Input
                            {...register('lastName')}
                            fontSize="md"
                            variant="subtle"
                            color="black"
                            placeholder="Last Name"
                            disabled={isLoading}
                        />
                        {errors.lastName && (
                            <Field.ErrorText>
                                {errors.lastName.message}
                            </Field.ErrorText>
                        )}
                    </Field.Root>

                    <Field.Root invalid={!!errors.password} required>
                        <Field.Label>
                            Password <Field.RequiredIndicator />
                        </Field.Label>
                        <PasswordInput
                            {...register('password', {
                                required: 'Password is required'
                            })}
                            fontSize="md"
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
                            Retype Password <Field.RequiredIndicator />
                        </Field.Label>
                        <PasswordInput
                            {...register('confirmPassword', {
                                required:
                                    'You have to type the same password again'
                            })}
                            fontSize="md"
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
                    Sign Up
                </Button>
                <Button
                    backgroundColor="brand.marigold"
                    color="brand.turtoise"
                    width="3/4"
                    onClick={() => push('/sign-in')}
                >
                    Back to Sign In
                </Button>
            </VStack>
        </form>
    )
}

export default RegistrationForm
