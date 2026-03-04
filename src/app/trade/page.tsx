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
import TradePopup from '@/components/ui/PopupUI';
import TradeCardPopup from '@/components/trading/PopupTrade';

type ContactMethod = {
  method: string;
  value: string;
};

type TradeCardProps = {
  username: string;
  avatarUrl?: string;
  rating: number;
  contacts?: ContactMethod[];
};

const TradePage = () => {
  const users: TradeCardProps[] = [
    { username: 'Nate Foss', rating: 4.5, contacts: [{ method: 'X', value: '1111111111' }, { method: 'Discord', value: '1111111111' }] },
    { username: 'Ava Johnson', rating: 4.0, contacts: [{ method: 'Instagram', value: '1111111111' }] },
    { username: 'Liam Smith', rating: 1, contacts: [{ method: 'Facebook', value: '1111111111' }] },
    { username: 'Maya Patel', rating: 3.5, contacts: [{ method: 'Discord', value: '1111111111' }, { method: 'Whatsapp', value: '1111111111' }] },
    { username: 'Carlos Ruiz', rating: 2, contacts: [{ method: 'Whatsapp', value: '1111111111' }] },
    { username: 'Zoe Kim', rating: 5, contacts: [{ method: 'X', value: '1111111111' }] },
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
          <Box
            alignItems="center"
            onClick={() =>
              TradePopup.open('trade', {
                title: 'Trade with ' + u.username,
                content: <TradeCardPopup
                  key={u.username}
                  username={u.username}
                  contacts={u.contacts}
                />,
                onClickClose: () => TradePopup.close('trade')
              })
            } >
            <TradeCard
              key={u.username}
              username={u.username}
              avatarUrl={u.avatarUrl}
              rating={u.rating}
            />
          </Box>
        ))}
        <TradePopup.Viewport />

      </Flex>
    </Box>
  );
};

export default TradePage
