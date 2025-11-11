'use client';

import React from 'react';
import {
  Box,
  Image,
  Heading,
  Text,
  Card,
  Flex,
  Progress,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { LuSparkle, LuSparkles } from 'react-icons/lu';

interface PokemonSetProps {
  label: string;
  image: string;
  description?: string;
  masterSet?: number;
  grandmasterSet?: number;
}

const PokemonSet: React.FC<PokemonSetProps> = ({
  label,
  image,
  description,
  masterSet = 100, // default 100%
  grandmasterSet = 100, // default 100%
}) => {
  return (
    <Box w="100%" maxW="300px" mx="auto">
      <Card.Root
        direction="column"
        overflow="hidden"
        w="100%"
        h="400px"
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        _hover={{ transform: 'scale(1.02)', boxShadow: 'xl' }}
        transition="0.2s ease"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        {/* Image section */}
        <Flex
          align="center"
          justify="center"
          h="60%"
          bg="gray.50"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Image
            src={image}
            alt={label}
            objectFit="contain"
            maxH="100%"
            maxW="90%"
            p={4}
            style={{
              imageRendering: 'pixelated',
              transform: 'translateZ(0)',
            }}
          />
        </Flex>

        {/* Text + Progress bars */}
        <Card.Body
          h="40%"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          textAlign="center"
          p={4}
        >
          <Heading size="md">{label}</Heading>
          <Text color="gray.600" mt={2}>
            {description}
          </Text>

          {/* Progress bars section */}
          <Box mt={4} w="100%">
            <HStack mb={2}>
              <Icon as={LuSparkle} color="yellow.500" boxSize={4} />
              <Progress.Root
                value={masterSet}
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
                value={grandmasterSet}
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
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default PokemonSet;
