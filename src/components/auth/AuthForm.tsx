'use client';
import { Button, Field, Heading, Input, VStack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { LoginFormValues } from '@/types/auth';

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signIn } = useAuth();
  const { push } = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    // Supabase Auth sign in user
    const res = await signIn(values.email, values.password);

    // Handle Supabase Auth successful sign in
    if (res.success) {
      push('/home');
    }

    // Handle Supabase Auth sign in error
    else if (res.error) {
      if (res.error === 'Invalid login credentials') {
        setError('root', {
          type: 'invalid_credentials',
          message:
            "An account doesn't exist with this email and password combination. Please create an account or reset your password.",
        });
      } else if (res.error === 'Email not confirmed') {
        setError('root', {
          type: 'email_not_confirmed',
          message:
            'Your email address has not been confirmed. Please check your inbox for a confirmation email.',
        });
      }
    }
    setIsLoading(false);
  };

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
          <Field.Root invalid={!!errors.email} required>
            <Field.Label>
              Email <Field.RequiredIndicator />
            </Field.Label>
            <Input
              {...register('email', { required: 'Email is required' })}
              variant="subtle"
              color="black"
              placeholder="me@example.com"
              disabled={isLoading}
            />
            {errors.email && errors.email.type === 'required' && (
              <Field.ErrorText>{errors.email.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.password} required>
            <Field.Label>
              Password <Field.RequiredIndicator />
            </Field.Label>
            <PasswordInput
              {...register('password', { required: 'Password is required' })}
              variant="subtle"
              color="black"
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && errors.password.type === 'required' && (
              <Field.ErrorText>{errors.password.message}</Field.ErrorText>
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
          onClick={() => alert('Redirect to Google Sign-In')}
        >
          Sign In With Google
        </Button>

        <Button
          backgroundColor="brand.marigold"
          color="brand.turtoise"
          width="3/4"
          onClick={() => alert('Redirect to Apple Sign-In')}
        >
          Sign In With Apple
        </Button>

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
  );
}
