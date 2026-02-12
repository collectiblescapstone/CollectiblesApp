'use client';

import React from 'react';
import Divider from '@/components/profiles/Divider';
import {
    Flex,
    Image,
    Text,
    Button,
} from '@chakra-ui/react';
import { useRandomCards } from '@/components/personal-profile/RandomCard'; // for now, change later
import { PokemonCardImage } from '@/types/personal-profile';
import { useRouter } from 'next/navigation';

const TradeSuggestions: React.FC = () => {
    const { cards, loading } = useRandomCards('ex5', 3);
    const router = useRouter();

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
            <Divider />
            <Flex mt={1}>
                <Text fontSize="md" color="gray.700" fontWeight="semibold" mb={2}>
                    TradePost Suggestion
                </Text>
            </Flex>
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
                <Text>[USERNAME]</Text>
            </Flex>
        {/*add a button here to take you to page trade\page.tsx*/}
            <Button size="xs" aria-label="See more trade suggestions" onClick={() => router.push('/trade')}>+ Go to TadePost</Button>

        </Flex>
    );
};

export default TradeSuggestions;
