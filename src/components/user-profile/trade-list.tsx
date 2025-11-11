'use client';

import React from 'react';
import Divider from '@/components/user-profile/divider';
import { useRouter } from 'next/navigation';
import { Button, Flex, Image, Text } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

type Card = {
  id: string;
  title: string;
  image: string;
};

type cards = { items: Card[] };

const TradeList: React.FC<cards> = ({ items }) => {
    const router = useRouter();

    const display = items.slice(0, 3);
    const viewmore = items.length > 3;

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
        <Divider />
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
        {display.map((card) => (
            <Flex
            key={card.id}
            >
            <Image
                src={card.image}
                alt="Trade List Card"
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