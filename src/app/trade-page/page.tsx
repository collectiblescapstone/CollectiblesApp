'use client';

import React from "react";
import {
    Avatar,
    Card, Flex,
    HStack,
    Stack,
    Text,
    Box,
} from "@chakra-ui/react"
import TradingCards from "@/components/trading/TradingCards";


type TradeCardProps = {
    username: string;
    avatarUrl?: string;
};

const TradeCard: React.FC<TradeCardProps> = ({ username, avatarUrl }) =>{
    return (
        <Card.Root width="80%">
            <Card.Body>
                <TradingCards />
            </Card.Body>
            <Card.Footer>
                <HStack mb="0" gap="3">
                    <Avatar.Root>
                        <Avatar.Image src={avatarUrl ?? "https://images.unsplash.com/photo-1511806754518-53bada35f930"} />
                        <Avatar.Fallback name={username} />
                    </Avatar.Root>
                    <Stack gap="0">
                        <Text fontWeight="semibold" textStyle="sm">
                            {username}
                        </Text>
                    </Stack>
                    <Stack gap="0">
                        <Text fontWeight="semibold" textStyle="sm">
                            this is the star
                        </Text>
                    </Stack>
                </HStack>
            </Card.Footer>
        </Card.Root>
    )
};

const tradePage = () => {
    const users: TradeCardProps[] = [
        { username: 'Nate Foss' },
        { username: 'Ava Johnson' },
        { username: 'Liam Smith' },
        { username: 'Maya Patel' },
        { username: 'Carlos Ruiz' },
        { username: 'Zoe Kim' },
    ];

    return (
        <Box bg="white" minH="100vh" color="black" mb={4}>
            <Flex flexDirection="column" alignItems="center" gap={2}>
                <Flex
                    flexDirection="row"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                >
                </Flex>
                {users.map(u => (
                    <TradeCard key={u.username} username={u.username} avatarUrl={u.avatarUrl} />
                ))}
            </Flex>
        </Box>
    )
};

export default tradePage;