'use client';

import React from 'react';
import Divider from '@/components/user-profile/Divider';
import { Flex, Image, Text, Spinner, SimpleGrid } from '@chakra-ui/react';
import { useRandomCards } from '@/components/personal-profile/RandomCard';
import { PokemonCardImage } from '@/types/personal-profile';

const Showcase: React.FC = () => {
  const { cards, loading } = useRandomCards('ex5', 3);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh" gap={3}>
        <Spinner color="black" />
        <Text>Loading...</Text>
      </Flex>
    );
  }

  if (cards.length === 0) {
    return (
      <Flex
        flexDirection="column"
        gap={2}
        justifyContent="flex-start"
        alignItems="flex-start"
        w="100%"
        px={4}
      >
        <Divider />
        <Flex mt={1}>
          <Text fontSize="md" color="gray.900" fontWeight="semibold" mb={2}>
            Showcase
          </Text>
        </Flex>
        <Flex w="100%" justifyContent="center" alignItems="center" py={3}>
          <Text fontSize="md" color="gray.600" fontWeight="semibold" mb={2}>
            User has not added any cards...yet
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      flexDirection="column"
      gap={2}
      justifyContent="flex-start"
      alignItems="flex-start"
      w="100%"
      px={4}
    >
      <Divider />
      <Flex mt={1}>
        <Text fontSize="md" color="gray.900" fontWeight="semibold" mb={2}>
          Showcase
        </Text>
      </Flex>
      <SimpleGrid columns={{ base: 3 }} w="100%" gap={10}>
        {cards.map((card: PokemonCardImage, index: number) => (
          <Flex key={index}>
            <Image
              src={`${card.image}/high.png`}
              alt={card.name}
              w="105px"
              h="auto"
              borderRadius="none"
            />
          </Flex>
        ))}
      </SimpleGrid>
    </Flex>
  );
};

export default Showcase;
