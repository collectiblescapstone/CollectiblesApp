'use client';
import { Button, Field, Heading, Input, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PasswordInput } from '@/components/ui/password-input';

export default function LoginForm() {
  const [password, setPassword] = useState('');

  return (
    <VStack
      gap="10"
      width="1/3"
      backgroundColor="whiteAlpha.300"
      padding={16}
      rounded="xl"
    >
      <Heading size="5xl">Login</Heading>
      <Field.Root required>
        <Field.Label>
          Email <Field.RequiredIndicator />
        </Field.Label>
        <Input placeholder="me@example.com" variant="subtle" color="black" />
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
        />
      </Field.Root>
      <Button backgroundColor="teal" width="full">
        Login
      </Button>
    </VStack>
  );
}
