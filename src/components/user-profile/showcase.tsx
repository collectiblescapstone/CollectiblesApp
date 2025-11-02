'use client';

import React from 'react';
import { Box, Flex, Image, Text } from '@chakra-ui/react';

type CardType = {
  imageSrc: string;
};

const cards: CardType[] = [
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'}
];

const Showcase: React.FC = () => {
    if (cards.length === 0) return null;
  return (
    <Flex
    flexDirection="column"
    gap={2}
    justifyContent="flex-start"
    alignItems="flex-start"
    w="100%"
    px={6}
    >
        <Box height="2px" width="97%" bg="gray.500" mt={5}/>
        <Flex
        mt={1}
        >
        <Text fontSize="md" color="gray.700" fontWeight="semibold" mb={2}>
            Showcase
        </Text>
        </Flex>
        <Flex
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        wrap="wrap"
        gap={7}
        >
        {cards.map((card, index) => (
            <Flex
            key={index}
            >
            <Image
                src={card.imageSrc}
                w="105px"
                h="auto"
                borderRadius="none"
            />
            </Flex>
        ))}
        </Flex>
    </Flex>
  );
};

export default Showcase;
