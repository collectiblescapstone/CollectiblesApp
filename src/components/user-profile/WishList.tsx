'use client';

import React from 'react';
import Divider from '@/components/user-profile/Divider';
import { useRouter } from 'next/navigation';
import { Button, Flex, Image, Text } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { CardType } from '@/types/user-profile';

const cards: CardType[] = [
  { imageSrc: '/user-profile/card_temp.png' },
  { imageSrc: '/user-profile/card_temp.png' },
  { imageSrc: '/user-profile/card_temp.png' },
  { imageSrc: '/user-profile/card_temp.png' },
];

const WishList: React.FC = () => {
  const router = useRouter();

  const display = cards.slice(0, 3);
  const viewmore = cards.length > 3;

  const press = () => {
    router.push('/user-profile/wish');
  };

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
          Wish List
        </Text>
      </Flex>
      <Flex
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        wrap="wrap"
        gap={5}
      >
        {display.map((card, index) => (
          <Flex key={index}>
            <Image
              src={card.imageSrc}
              alt="Wish List Card"
              w="105px"
              h="auto"
              borderRadius="none"
            />
          </Flex>
        ))}
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

export default WishList;
