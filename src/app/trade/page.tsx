'use client'

import React from 'react'
import {
  Flex,
  HStack,
  Box,
  Heading,
  Slider,
} from '@chakra-ui/react';
import TradeCard from '@/components/trading/TradeCard';

type TradeCardProps = {
  username: string;
  avatarUrl?: string;
  rating: number;
};

const TradePage = () => {
  const users: TradeCardProps[] = [
    { username: 'Nate Foss', rating: 4.5 },
    { username: 'Ava Johnson', rating: 4.0 },
    { username: 'Liam Smith', rating: 1 },
    { username: 'Maya Patel', rating: 3.5 },
    { username: 'Carlos Ruiz', rating: 2 },
    { username: 'Zoe Kim', rating: 5 },
  ];

  return (
    <Box bg="white" minH="100vh" color="black" mb={4}>
      <Flex flexDirection="column" alignItems="center" gap={2}>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        ></Flex>
        <Box w="100%" position="relative" px={4}>
          <Heading
            mt={1}
            fontSize="2xl"
            textAlign="center"
            fontWeight={'Bold'}
            fontFamily="var(--font-sans)"
            maxW="container.md"
            mx="auto"
          >
            TradePost
          </Heading>

          <Box
            position="absolute"
            right={4}
            top="50%"
            transform="translateY(-50%)"
          >
            <Slider.Root maxW="sm" size="sm" defaultValue={[40]}>
              <HStack justify="space-between">
                <Slider.Label>Distance</Slider.Label>
                <Slider.ValueText />
              </HStack>
              <Slider.Control>
                <Slider.Track>
                  <Slider.Range />
                </Slider.Track>
                <Slider.Thumbs />
              </Slider.Control>
            </Slider.Root>
          </Box>
        </Box>
        {users.map((u) => (
          <TradeCard
            key={u.username}
            username={u.username}
            avatarUrl={u.avatarUrl}
            rating={u.rating}
          />
        ))}
      </Flex>
    </Box>
  );
};

export default TradePage
