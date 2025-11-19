'use client';

import React from 'react';
import { Box, Flex, Image, Text, Button } from '@chakra-ui/react';
import { FiXCircle } from 'react-icons/fi';
import { useRandomCards } from '@/components/personal-profile/RandomCard';
import { PokemonCardImage } from '@/types/personal-profile';

const Showcase: React.FC = () => {
  const removecard = () => {
    // Edit remove card item logic here
  };

  const { cards, loading } = useRandomCards('ex5', 3);
  if (loading) return <Text>Loading cards...</Text>;

  return (
    <Flex flexDirection="column" gap={2}>
      <Flex justifyContent="flex-start" alignItems="flex-start" w="100%">
        <Text fontSize="sm" color="gray.700" fontWeight="semibold" mb={2}>
          Showcase
        </Text>
      </Flex>
      <Flex
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        wrap="wrap"
        gap={6}
        px={1}
      >
        {cards.map((card: PokemonCardImage, index: number) => (
          <Flex key={index} position="relative">
            <Box
              position="relative"
              w="97px"
              h="auto"
              overflow="hidden"
              alignItems={'center'}
            >
              <Image
                src={`${card.image}/high.png`}
                alt={card.name}
                w="97px"
                h="auto"
                borderRadius="none"
              />
              <Box
                position="absolute"
                top={0}
                left={0}
                w="100%"
                h="100%"
                bg="black"
                opacity={0.5}
              />
              <Flex
                position="absolute"
                justifyContent="center"
                alignItems="center"
                top={0}
                left={0}
                w="100%"
                h="100%"
              >
                <Button
                  onClick={removecard}
                  position="absolute"
                  size="2xl"
                  rounded="sm"
                  variant="ghost"
                >
                  <FiXCircle color="white" />
                </Button>
              </Flex>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default Showcase;
