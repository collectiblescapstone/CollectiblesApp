import { LuSparkle, LuSparkles } from 'react-icons/lu';
import { Box, Image, Icon, Progress } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react/stack';

export default function PokemonPolaroid({ id }: { id: number }) {
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  const progress1 = Math.floor(Math.random() * 70) + 30;
  const progress2 = Math.floor(Math.random() * 70) + 30;

  return (
    <Box
      bg="white"
      boxShadow="lg"
      borderRadius="md"
      w="150px"
      h="200px"
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
    >
      {/* Pokémon Image */}
      <Image
        src={imageUrl}
        alt={`Pokemon ${id}`}
        boxSize="80px"
        objectFit="contain"
        mt={2}
      />

      {/* Stats Section */}
      <Box w="100%" mb={2}>
        <HStack>
          <Icon as={LuSparkle} color="black" boxSize={4} />
          <Progress.Root value={progress1} variant="outline" maxW="sm">
            <HStack gap="5">
              <Progress.Track flex="1" bg="yellow.100">
                <Progress.Range bg="yellow.400" />
              </Progress.Track>
            </HStack>
          </Progress.Root>
        </HStack>

        <HStack>
          <Icon as={LuSparkles} color="black" boxSize={4} />
          <Progress.Root value={progress2} variant="outline" maxW="sm">
            <HStack gap="5">
              <Progress.Track flex="1" bg="yellow.100">
                <Progress.Range bg="yellow.400" />
              </Progress.Track>
            </HStack>
          </Progress.Root>
        </HStack>
      </Box>
    </Box>
  );
}
