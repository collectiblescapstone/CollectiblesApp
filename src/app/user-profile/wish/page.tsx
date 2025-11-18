'use client';

import React from 'react';

import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { useRandomCards } from '@/components/personal-profile/RandomCard';
import { PokemonCardImage } from '@/types/personal-profile';

const WishScreen: React.FC = () => {
  const { cards, loading } = useRandomCards('pop1', 7);
  if (loading) return <Text>Loading cards...</Text>;
  const cardsnum = cards.length;

  return (
    <Box bg="white" minH="100vh" color="black">
      <Flex flexDirection="column" gap={6} mt={4}>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          px={4}
          gap={4}
        >
          <Avatar.Root boxSize="75px" shape="rounded">
            <Avatar.Image src="/user-profile/pfp_temp.jpg" />
            <Avatar.Fallback> SA </Avatar.Fallback>
          </Avatar.Root>
          <Flex
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            gap={2}
          >
            <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
              Sandra Smith Anne
            </Heading>
            <Text fontSize="md" color="gray.600" fontWeight={'semibold'}>
              Wish List - {cardsnum} Items
            </Text>
          </Flex>
        </Flex>
        <Flex justifyContent="center" alignItems="center" mt={-4}>
          <Box height="2px" width="90%" bg="gray.500" mt={5} />
        </Flex>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          wrap="wrap"
          gap={7}
        >
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
        </Flex>
      </Flex>
    </Box>
  );
};

export default WishScreen;
