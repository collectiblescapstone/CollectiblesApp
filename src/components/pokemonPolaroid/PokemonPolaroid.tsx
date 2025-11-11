'use client';

import { LuSparkle, LuSparkles } from 'react-icons/lu';
import { Box, Image, Icon, Progress, HStack } from '@chakra-ui/react';

interface PokemonPolaroidProps {
  id: number;
  masterSet: number;
  grandmasterSet: number;
}

export default function PokemonPolaroid({
  props,
}: {
  props: PokemonPolaroidProps;
}) {
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${props.id}.png`;

  return (
    <Box
      as="button"
      bg="white"
      boxShadow="lg"
      borderRadius="md"
      w={{ base: '45vw', md: '200px' }}
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)', boxShadow: 'xl' }}
      _active={{ transform: 'scale(0.98)' }}
      // cursor="pointer" CHANGE THIS WHEN IT BECOMES CLICKY
    >
      {/* Pokémon Image */}
      <Image
        src={imageUrl}
        alt={`Pokemon ${props.id}`}
        boxSize={{ base: '40vw', md: '200px' }}
        objectFit="contain"
        mt={2}
        css={{
          imageRendering: 'pixelated',
          transform: 'translateZ(0)',
        }}
      />
      {/* Stats Section */}
      <Box w="100%" mb={2}>
        <HStack mb={1}>
          <Icon as={LuSparkle} color="yellow.500" boxSize={4} />
          <Progress.Root
            value={props.masterSet}
            max={100}
            w="100%"
            h="6px"
            borderRadius="full"
            overflow="hidden"
          >
            <Progress.Track bg="gray.100">
              <Progress.Range bg="yellow.400" />
            </Progress.Track>
          </Progress.Root>
        </HStack>

        <HStack>
          <Icon as={LuSparkles} color="yellow.500" boxSize={4} />
          <Progress.Root
            value={props.grandmasterSet}
            max={100}
            w="100%"
            h="6px"
            borderRadius="full"
            overflow="hidden"
          >
            <Progress.Track bg="gray.100">
              <Progress.Range bg="yellow.400" />
            </Progress.Track>
          </Progress.Root>
        </HStack>
      </Box>
    </Box>
  );
}
