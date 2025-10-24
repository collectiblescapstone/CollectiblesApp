import React from 'react';
import LoginForm from '@/components/login/LoginForm';
import { Flex } from '@chakra-ui/react';

export default function LoginPage() {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="dvh"
      minWidth="dvw"
    >
      <LoginForm />
    </Flex>
  );
}
