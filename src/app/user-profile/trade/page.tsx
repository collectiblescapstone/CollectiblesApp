'use client';

import React from 'react';
import { CardType } from '@/types/user-profile';

import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';

const cards: CardType[] = [
  { imageSrc: '/user-profile/card_temp.png' },
  { imageSrc: '/user-profile/card_temp.png' },
  { imageSrc: '/user-profile/card_temp.png' },
  { imageSrc: '/user-profile/card_temp.png' },
  { imageSrc: '/user-profile/card_temp.png' },
  { imageSrc: '/user-profile/card_temp.png' },
  { imageSrc: '/user-profile/card_temp.png' },
];

const TradeScreen: React.FC = () => {
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
              Trade List - {cardsnum} Items
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
          {cards.map((card, index) => (
            <Flex key={index}>
              <Image
                src={card.imageSrc}
                alt="Trade List Card"
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

export default TradeScreen;
