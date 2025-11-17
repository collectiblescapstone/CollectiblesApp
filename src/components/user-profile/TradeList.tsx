'use client';

import React from 'react';
import Divider from '@/components/user-profile/Divider';
import { useRouter } from 'next/navigation';
import { Button, Flex, Image, Text } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { useRandomCards } from '@/components/personal-profile/RandomCard';
import { PokemonCardImage } from '@/types/personal-profile';

const hardcodedCards: PokemonCardImage[] = [
  { name: 'Mareep', image: 'https://assets.tcgdex.net/en/swsh/swsh12.5/GG34' },
  { name: 'Riolu', image: 'https://assets.tcgdex.net/en/swsh/swsh12.5/GG26' },
];

const TradeList: React.FC = () => {
  const router = useRouter();

  const { cards, loading } = useRandomCards('pl4', 4);
  if (loading) return <Text>Loading cards...</Text>;

  const display = cards.slice(0, 2);
  const viewmore = cards.length > 2;

  const press = () => {
    router.push('/user-profile/trade');
  };

  const hardcodedCard =
    hardcodedCards[Math.floor(Math.random() * hardcodedCards.length)];

  return (
    <Flex
      flexDirection="column"
      gap={2}
      justifyContent="flex-start"
      alignItems="flex-start"
      w="100%"
      px={4}
    >
      <Divider />
      <Flex mt={1}>
        <Text fontSize="md" color="gray.700" fontWeight="semibold" mb={2}>
          Trade List
        </Text>
      </Flex>
      <Flex
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        wrap="wrap"
        gap={5}
      >
        {display.map((card: PokemonCardImage, index: number) => (
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
        <Image
          src={`${hardcodedCard.image}/high.png`}
          alt={hardcodedCard.name}
          w="105px"
          h="auto"
          borderRadius="none"
        />
      </Flex>
      <Flex mt={3}>
        {viewmore && (
          <Button variant="solid" colorScheme="black" size="sm" onClick={press}>
            <FiPlus /> View more
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default TradeList;
