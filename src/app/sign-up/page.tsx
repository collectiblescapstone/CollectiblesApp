import React from 'react';
import { Flex } from '@chakra-ui/react';
import RegistrationForm from '@/components/auth/RegistrationForm';

export default function SignUpPage() {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="inherit"
      minWidth="dvw"
    >
      <RegistrationForm />
    </Flex>
  );
}
