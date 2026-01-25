'use client';

import React from 'react';
import { Box, Image, VStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

interface PokemonCardMiniProps {
  cardName: string;
  image: string;
  cardId: string; // actual card ID, e.g., "sv01-001"
  // illustrator?: string;
  // rarity?: string;
}

export default function PokemonCardMini({
  cardName,
  image,
  cardId,
  // illustrator,
  // rarity,
}: PokemonCardMiniProps) {
  return (
    <Link
      href={{
        pathname: '/edit-card',
        query: {
          imageUrl: image,
          cardName: cardName,
          cardSet: cardId,
        },
      }}
    >
      <Box
        as="button"
        aria-label={cardName}
        bg="white"
        boxShadow="lg"
        borderRadius="md"
        w={{ base: 'auto', md: '160px' }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        transition="transform 0.2s"
        _hover={{ transform: 'scale(1.05)', boxShadow: 'xl' }}
        _active={{ transform: 'scale(0.98)' }}
        cursor="pointer"
      >
        {/* Card Image */}
        <Box
          bg="gray.50"
          w={{ base: '40vw', md: '100%' }}
          borderRadius="md"
          overflow="hidden"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Image
            src={image + '/low.jpg'}
            alt={cardName}
            objectFit="contain"
            width="100%"
            style={{ imageRendering: 'auto', transform: 'translateZ(0)' }}
          />
        </Box>

        {/* Text Info */}
        <VStack mt={2} w="100%" textAlign="center">
          <Text
            fontWeight="bold"
            fontSize="md"
            color="black" // high contrast
            textShadow="0 0 2px rgba(255, 255, 255, 0.8)" // subtle outline
          >
            {cardName}
          </Text>

          {/* Show the actual card ID */}
          <Text fontSize="sm" color="gray.600">
            {cardId}
          </Text>
        </VStack>
      </Box>
    </Link>
  );
}
