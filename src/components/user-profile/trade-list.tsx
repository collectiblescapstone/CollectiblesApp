'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, Flex, Image, Text } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

type CardType = {
  imageSrc: string;
};

const cards: CardType[] = [
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'}
];

const TradeList: React.FC = () => {
    const router = useRouter();

    const display = cards.slice(0, 3);
    const viewmore = cards.length > 3;

    const press = () => {
        router.push('/user-profile/trade');
    };

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
            Trade List
        </Text>
        </Flex>
        <Flex
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        wrap="wrap"
        gap={7}
        >
        {display.map((card, index) => (
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
        <Flex
        mt={3}
        >
            {viewmore && (
                <Button
                variant="solid"
                colorScheme="black"
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