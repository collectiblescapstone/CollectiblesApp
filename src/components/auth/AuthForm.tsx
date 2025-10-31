'use client';
import {
  Button,
  Field,
  Heading,
  Input,
  VStack,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';

export type AuthFormProps = {
  type: 'signin' | 'signup';
};

export default function AuthForm({ type }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { signIn, signUp } = useAuth();
  const { push } = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (type === 'signin') {
      const result = await signIn(email, password);
      if (!result.success) {
        alert(`Login failed: ${result.error}`);
      } else {
        alert('Login successful!');
        push('/');
      }
    } else {
      const result = await signUp(email, password);
      if (!result.success) {
        alert(`Sign-up failed: ${result.error?.message}`);
      } else {
        alert(
          'Sign-up successful! Please check your email to confirm your account.'
        );
        push('/sign-in');
      }
    }

    setIsLoading(false);
  };

  const name = type === 'signin' ? 'Sign In' : 'Sign Up';

  return (
    <VStack
      gap="10"
      width="1/3"
      backgroundColor="whiteAlpha.300"
      padding={16}
      rounded="xl"
    >
      <Heading size="5xl">{name}</Heading>
      <Field.Root required>
        <Field.Label>
          Email <Field.RequiredIndicator />
        </Field.Label>
        <Input
          value={email}
          variant="subtle"
          color="black"
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="me@example.com"
          disabled={isLoading}
        />
      </Field.Root>
      <Field.Root required>
        <Field.Label>
          Password <Field.RequiredIndicator />
        </Field.Label>
        <PasswordInput
          value={password}
          variant="subtle"
          color="black"
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </Field.Root>
      {type === 'signin' && (
        <Text>
          Don&apos;t have an account?{' '}
          <ChakraLink color="teal" href="/sign-up">
            Sign up!
          </ChakraLink>
        </Text>
      )}
      <Button
        backgroundColor="teal"
        width="3/4"
        onClick={(e) => handleSubmit(e)}
      >
        {name}
      </Button>
    </VStack>
  );
}
