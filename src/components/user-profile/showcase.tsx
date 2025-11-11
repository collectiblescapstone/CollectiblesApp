'use client';

import React from 'react';
import Divider from '@/components/user-profile/divider'; 
import { Card, Flex, Image, Text } from '@chakra-ui/react';

type Card = {
  id: string;
  title: string;
  image: string;
};

type cards = { items: Card[] };

const Showcase: React.FC<cards> = ({ items }) => {
    if (items.length === 0) return null;
  return (
    <Flex
    flexDirection="column"
    gap={2}
    justifyContent="flex-start"
    alignItems="flex-start"
    w="100%"
    px={6}
    >
        <Divider />
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
        {items.map((card) => (
            <Flex
            key={card.id}
            >
            <Image
                src={card.image}
                alt={card.title}
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
