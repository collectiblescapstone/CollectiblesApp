'use client';

import React from 'react';
import { Box, Flex, Image, Text } from '@chakra-ui/react';

import { FiXCircle } from 'react-icons/fi';

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
    >
        <Text fontSize="sm" color="gray.700" fontWeight="semibold" mb={2}>
            Showcase
        </Text>
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
            <Box 
                position="relative" 
                w="105px"
                h="auto" 
                overflow="hidden"
            >
                <Image
                    src={card.imageSrc}
                    alt="Showcase Card"
                    w="105px"
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
                    <FiXCircle size={26} color='white'/>
                </Flex>
            </Box>
            </Flex>
        ))}
        </Flex>
    </Flex>
  );
};

export default Showcase;
