'use client';

import React from 'react';
import Divider from '@/components/user-profile/Divider';
import { useRouter } from 'next/navigation';
import {
  Button,
  Flex,
  Image,
  Text,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
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

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh" gap={3}>
        <Spinner color="black" />
        <Text>Loading...</Text>
      </Flex>
    );
  }

  const display = cards.slice(0, 2);
  const viewmore = cards.length > 2;

  if (cards.length === 0) {
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
          <Text fontSize="md" color="gray.900" fontWeight="semibold" mb={2}>
            Trade List
          </Text>
        </Flex>
        <Flex w="100%" justifyContent="center" alignItems="center" py={3}>
          <Text fontSize="md" color="gray.600" fontWeight="semibold" mb={2}>
            User has not added any cards...yet
          </Text>
        </Flex>
      </Flex>
    );
  }

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
        <Text fontSize="md" color="gray.900" fontWeight="semibold" mb={2}>
          Trade List
        </Text>
      </Flex>
      <SimpleGrid columns={{ base: 3 }} w="100%" gap={10}>
        {display.map((card: PokemonCardImage, index: number) => (
          <Flex key={index}>
            <Image
              src={`${card.image}/low.png`}
              alt={card.name}
              w="105px"
              h="auto"
              borderRadius="none"
            />
          </Flex>
        ))}
        <Image
          src={`${hardcodedCard.image}/low.png`}
          alt={hardcodedCard.name}
          w="105px"
          h="auto"
          borderRadius="none"
        />
      </SimpleGrid>
      <Flex mt={3}>
        {viewmore && (
          <Button
            variant="solid"
            bg="brand.turtiose"
            color="white"
            size="sm"
            onClick={press}
          >
            <FiPlus /> View more
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default TradeList;
