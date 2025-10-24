import { Button, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="dvh"
    >
      <Heading>Welcome to Collectibles App!</Heading>
      <Link href="/login">
        <Button mt={4}>Go to Login</Button>
      </Link>
    </Flex>
  );
}
