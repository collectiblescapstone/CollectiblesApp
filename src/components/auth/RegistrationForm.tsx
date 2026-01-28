'use client';
import { Button, Field, Heading, Input, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { SignupFormValues } from '@/types/auth';

const RegistrationForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signUp } = useAuth();
  const { push } = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    // Check if passwords match
    if (values.password !== values.confirmPassword) {
      setError('root', {
        type: 'password_mismatch',
        message: 'Passwords do not match. Please try again.',
      });
      setIsLoading(false);
      return;
    }

    // Supabase Auth sign up user
    const res = await signUp(values.email, values.password);

    // Handle Supabase Auth successful sign up
    if (res.success) {
      // Call API to register user in database
      const response = await fetch('/api/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: res.data.user?.id,
          email: values.email,
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      }).then((res) => res.json());

      // Check for username uniqueness error
      if (
        response.error &&
        response.message &&
        response.message.code === 'P2002'
      ) {
        setError('root', {
          type: 'username_taken',
          message:
            'An account with this username already exists. Please pick a different username.',
        });
      } else {
        push('/sign-in');
      }
    }

    // Handle errors from Supabase Auth Sign Up
    else if (res.error) {
      if (res.error.code === 'user_already_exists') {
        setError('root', {
          type: 'user_already_exists',
          message:
            'An account with this email already exists. Please signing in or reset your password.',
        });
      } else if (res.error.code === 'weak_password') {
        setError('root', {
          type: 'weak_password',
          message:
            'The password is not valid. It must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        });
      } else {
        setError('root', {
          type: 'unknown_error',
          message: 'An unexpected error occurred. Please try again.',
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

        <Heading size="lg">Sign Up for an account</Heading>

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

          <Field.Root invalid={!!errors.username} required>
            <Field.Label>
              Username <Field.RequiredIndicator />
            </Field.Label>
            <Input
              {...register('username', { required: 'Username is required' })}
              variant="subtle"
              color="black"
              placeholder="my_username"
              disabled={isLoading}
            />
            {errors.username && errors.username.type === 'required' && (
              <Field.ErrorText>{errors.username.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.firstName}>
            <Field.Label>First Name</Field.Label>
            <Input
              {...register('firstName')}
              variant="subtle"
              color="black"
              placeholder="First Name"
              disabled={isLoading}
            />
          </Field.Root>

          <Field.Root invalid={!!errors.lastName}>
            <Field.Label>Last Name</Field.Label>
            <Input
              {...register('lastName')}
              variant="subtle"
              color="black"
              placeholder="Last Name"
              disabled={isLoading}
            />
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
          </Field.Root>

          <Field.Root invalid={!!errors.confirmPassword} required>
            <Field.Label>
              Retype Password <Field.RequiredIndicator />
            </Field.Label>
            <PasswordInput
              {...register('confirmPassword', {
                required: 'You have to type the same password again',
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
        <Button backgroundColor="teal" width="3/4" type="submit">
          Sign Up
        </Button>
      </VStack>
    </form>
  );
};

export default RegistrationForm;
