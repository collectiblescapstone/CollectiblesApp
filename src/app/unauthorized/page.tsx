'use client';

import { Flex, VStack, Heading, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React from 'react';

const Unauthorized: React.FC = () => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/sign-in');
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100">
      <VStack gap={8} textAlign="center">
        <Heading as="h1" size="4xl" color="gray.800">
          401
        </Heading>
        <Text fontSize="2xl" color="gray.600">
          Unauthorized
        </Text>
        <Text color="gray.500">
          You don&apos;t have permission to access this page. Please log in to
          continue.
        </Text>
        <Button
          onClick={handleLoginRedirect}
          bg="blue.600"
          color="white"
          px={6}
          py={3}
          fontWeight="semibold"
          _hover={{ bg: 'blue.700' }}
        >
          Go to Login
        </Button>
      </VStack>
    </Flex>
  );
};

export default Unauthorized;
