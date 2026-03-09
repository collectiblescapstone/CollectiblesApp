'use client'
import { Button, Field, Heading, Input, VStack, Text } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuth } from '@/context/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { LoginFormValues } from '@/types/auth'
import { fetchUserProfile } from '@/utils/profiles/userNameProfilePuller'

const AuthForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { signIn, signInWithGoogle } = useAuth()
    const { push } = useRouter()
    const searchParams = useSearchParams()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<LoginFormValues>({
        defaultValues: {
            emailOrUsername: '',
            password: ''
        }
    })

    // Check for error query parameter on component mount
    useEffect(() => {
        const errorParam = searchParams.get('error')
        if (errorParam === 'registration_failed') {
            setError('root', {
                type: 'registration_failed',
                message:
                    'Google sign-in failed during registration. Please try again or contact support if the issue persists.'
            })
            // Clean up the URL parameter
            window.history.replaceState({}, '', '/sign-in')
        }
    }, [searchParams, setError])

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true)

        let emailValue = values.emailOrUsername.trim()
        if (!emailValue.includes('@')) {
            // Username cannot contain '@', while email must contain '@'
            try {
                const { email } = await fetchUserProfile(emailValue)
                emailValue = email
            } catch {
                setError('root', {
                    type: 'invalid_credentials',
                    message:
                        "An account doesn't exist with this email/username and password combination. Please create an account or reset your password."
                })
                setIsLoading(false)
                return
            }
        }

        // Supabase Auth sign in user
        const res = await signIn(emailValue, values.password)
        // Handle Supabase Auth successful sign in
        if (res.success) {
            push('/home')
        }

        // Handle Supabase Auth sign in error
        else if (res.error) {
            if (res.error === 'Invalid login credentials') {
                setError('root', {
                    type: 'invalid_credentials',
                    message:
                        "An account doesn't exist with this email/username and password combination. Please create an account or reset your password."
                })
            } else if (res.error === 'Email not confirmed') {
                setError('root', {
                    type: 'email_not_confirmed',
                    message:
                        'Your email address has not been confirmed. Please check your inbox for a confirmation email.'
                })
            } else {
                setError('root', {
                    type: 'unknown_error',
                    message:
                        'An unknown error occurred during sign in. Please try again later.'
                })
            }
        }
        setIsLoading(false)
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signInWithGoogle()
        } catch {
            setError('root', {
                type: 'oauth_error',
                message:
                    'An error occurred during Google sign in. Please try again later.'
            })
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

                <Heading size="lg">Sign In to your account</Heading>

                <Field.Root invalid={!!errors.root}>
                    <Field.Root invalid={!!errors.emailOrUsername} required>
                        <Field.Label>
                            Email or Username <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            {...register('emailOrUsername', {
                                required: 'Email or Username is required'
                            })}
                            variant="subtle"
                            color="black"
                            placeholder="me@example.com"
                            disabled={isLoading}
                        />
                        {errors.emailOrUsername &&
                            errors.emailOrUsername.type === 'required' && (
                                <Field.ErrorText>
                                    {errors.emailOrUsername.message}
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
                        <Field.HelperText
                            onClick={() => push('/forget-password')}
                            cursor="pointer"
                            color="purple.600"
                        >
                            Forgot your password?
                        </Field.HelperText>
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
                    Sign In
                </Button>

                <Text>OR</Text>

                <Button
                    backgroundColor="brand.marigold"
                    color="brand.turtoise"
                    width="3/4"
                    onClick={handleGoogleSignIn}
                >
                    Sign In With Google
                </Button>

                {/*Coming Soon: Apple Sign-In*/}
                {/* <Button
                    backgroundColor="brand.marigold"
                    color="brand.turtoise"
                    width="3/4"
                    onClick={() => alert('Redirect to Apple Sign-In')}
                >
                    Sign In With Apple
                </Button> */}

                <Text>OR</Text>

                <Button
                    backgroundColor="brand.marigold"
                    color="brand.turtoise"
                    width="3/4"
                    onClick={() => push('/sign-up')}
                >
                    Sign Up
                </Button>
            </VStack>
        </form>
    )
}

export default AuthForm
