import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { Flex } from '@chakra-ui/react';

export default function SignUpPage() {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="dvh"
      minWidth="dvw"
    >
      <AuthForm type="signup" />
    </Flex>
  );
}
