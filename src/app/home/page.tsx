'use client';
import { useAuth } from '@/context/AuthProvider';

import PopularCards from '@/components/home/PopularCards';
import Collection from '@/components/home/Collection';
import TradeSuggestions from '@/components/home/TradeSuggestions';

import { Box, Flex, Heading, Text, Spinner } from '@chakra-ui/react';

const HomePage = () => {
  const { loading, session } = useAuth();

  if (loading || !session) {
    return (
      <Box textAlign="center" mt={10}>
        Loading... <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="inherit"
      py={2}
    >
      <Heading
        mt={1}
        fontSize="2xl"
        textAlign="center"
        fontWeight={'Bold'}
        fontFamily="var(--font-sans)"
      >
        Welcome back [USERNAME]!
      </Heading>

      <Flex
        mt={4}
        px={4}
        w="100%"
        justifyContent="space-around"
        flexWrap="wrap"
        gap={6}
      >
        <Flex direction="column" alignItems="center" minW="180px">
          <Text fontSize="2xl" fontWeight="bold">
            0
          </Text>
          <Text fontSize="sm" color="gray.600">
            cards logged this month
          </Text>
        </Flex>

        <Flex direction="column" alignItems="center" minW="180px">
          <Text fontSize="2xl" fontWeight="bold">
            0
          </Text>
          <Text fontSize="sm" color="gray.600">
            total cards in collection
          </Text>
        </Flex>

        <Flex direction="column" alignItems="center" minW="180px">
          <Text fontSize="2xl" fontWeight="bold">
            0
          </Text>
          <Text fontSize="sm" color="gray.600">
            cards up for trade
          </Text>
        </Flex>
      </Flex>

      <PopularCards />
      <Collection />
      <TradeSuggestions />
    </Flex>
  );
};

export default HomePage;
