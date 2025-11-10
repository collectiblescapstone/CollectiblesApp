'use client';

import React from 'react';
import { Box, Image, Heading, Text, Card } from '@chakra-ui/react';

interface PokemonSetProps {
  label: string;
  image: string;
  description?: string;
  // optional props you might want later:
  // onClick?: () => void;
  // href?: string;
}

const PokemonSet: React.FC<PokemonSetProps> = ({
  label,
  image,
  description,
}) => {
  return (
    <Box mt={8} w="100%">
      {/* Using your Card.Root / Card.Body pattern */}
      <Card.Root
        direction={{ base: 'column', md: 'row' }}
        overflow="hidden"
        w="100%"
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        _hover={{ transform: 'scale(1.02)', boxShadow: 'xl' }}
        transition="0.2s ease"
      >
        <Image
          src={image}
          alt={label}
          objectFit="contain"
          w={{ base: '100%', md: '400px' }}
          h="auto"
          p={4}
          style={{
            imageRendering: 'pixelated',
            transform: 'translateZ(0)',
          }}
        />

        <Card.Body>
          <Heading size="md">{label}</Heading>
          <Text color="gray.600" mt={2}>
            {description ||
              `The ${label} era introduced a new generation of cards and mechanics to the Pokémon TCG.`}
          </Text>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default PokemonSet;
