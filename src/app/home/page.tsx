'use client';
import { useAuth } from '@/context/AuthProvider';
import { Box, Button, Flex, Heading, Spinner } from '@chakra-ui/react';

const HomePage = () => {
  const { loading, session, signOut } = useAuth();

  if (loading || !session) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="inherit"
    >
      <Heading size="md" mt={4}>
        Logged in as: {session.user.email}
      </Heading>
      <Button mt={4} onClick={() => signOut()}>
        Sign Out
      </Button>
    </Flex>
  );
};

export default HomePage;
