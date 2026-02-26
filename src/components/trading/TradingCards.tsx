'use client';

import React from 'react';
import { Flex, Image, Text } from '@chakra-ui/react';
import { useRandomCards } from '@/components/personal-profile/RandomCard'; // for now, change later
import { PokemonCardImage } from '@/types/personal-profile';

const TradingCards: React.FC = () => {
  const { cards, loading } = useRandomCards('ex5', 3);

  if (loading) return <Text>Loading cards...</Text>;
  if (cards.length === 0) return null;

  return (
    <Flex
      flexDirection="column"
      gap={2}
      justifyContent="flex-start"
      alignItems="flex-start"
      w="100%"
      px={4}
    >
      <Flex
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        wrap="wrap"
        gap={5}
      >
        {cards.map((card: PokemonCardImage, index: number) => (
          <Flex key={index}>
            <Image
              src={`${card.image}/high.png`}
              alt={card.name}
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

export default TradingCards;
