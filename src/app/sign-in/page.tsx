import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { Flex } from '@chakra-ui/react';

export default function SignInPage() {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="inherit"
      minWidth="dvw"
    >
      <AuthForm type="signin" />
    </Flex>
  );
}
