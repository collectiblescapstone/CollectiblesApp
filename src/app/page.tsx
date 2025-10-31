'use client';
import { useAuth } from '@/context/AuthProvider';
import { Button, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';

export default function Home() {
  const { session, signOut } = useAuth();

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="dvh"
    >
      <Heading>Welcome to Collectibles App!</Heading>
      {session ? (
        <>
          <Heading size="md" mt={4}>
            Logged in as: {session.user.email}
          </Heading>
          <Button mt={4} onClick={() => signOut()}>
            Sign Out
          </Button>
        </>
      ) : (
        <Link href="/sign-in">
          <Button mt={4}>Go to Login</Button>
        </Link>
      )}
    </Flex>
  );
}
