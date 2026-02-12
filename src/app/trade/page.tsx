'use client';

import React from "react";
import {
    Avatar,
    Card, Flex,
    HStack,
    Stack,
    Text,
    Box,
    Heading,
    Slider,
} from "@chakra-ui/react"
import TradingCards from "@/components/trading/TradingCards";
import {
    LuStar,
} from 'react-icons/lu'


type TradeCardProps = {
    username: string;
    avatarUrl?: string;
    rating: number;
};

const TradeCard: React.FC<TradeCardProps> = ({ username, avatarUrl, rating}) =>{
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
                        {/* show star and numeric rating side-by-side */}
                        <HStack gap="1" align="center">
                            <Box>
                                {(() => {
                                    let color = '#ff3b30'
                                    if (rating <= 2.5) color = '#ff3b30';
                                    else if (rating < 4.0) color = '#ffd60a';
                                    else if (rating < 5) color = '#32d74b';
                                    else color = '#08a9c6';
                                    return <LuStar color={color} size={20} />;
                                })()}
                            </Box>
                            <Text fontSize="sm" fontWeight="semibold">{Number.isFinite(rating) ? rating.toFixed(1) : '-'}</Text>
                        </HStack>
                    </Stack>
                </HStack>
            </Card.Footer>
        </Card.Root>
     )
 };

const tradePage = () => {
    const users: TradeCardProps[] = [
        { username: 'Nate Foss', rating: 4.5 },
        { username: 'Ava Johnson', rating: 4.0 },
        { username: 'Liam Smith', rating: 1 },
        { username: 'Maya Patel', rating: 3.5 },
        { username: 'Carlos Ruiz', rating: 2 },
        { username: 'Zoe Kim', rating: 5 },
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
                <Box w="100%" position="relative" px={4}>
                    <Heading mt={1} fontSize="2xl" textAlign="center" fontWeight={'Bold'} fontFamily="var(--font-sans)" maxW="container.md" mx="auto">
                        TradePost
                    </Heading>

                    <Box position="absolute" right={4} top="50%" transform="translateY(-50%)">
                        <Slider.Root maxW="sm" size="sm" defaultValue={[40]}>
                            <HStack justify="space-between">
                                <Slider.Label>Distance</Slider.Label>
                                <Slider.ValueText />
                            </HStack>
                            <Slider.Control>
                                <Slider.Track>
                                    <Slider.Range />
                                </Slider.Track>
                                <Slider.Thumbs />
                            </Slider.Control>
                        </Slider.Root>
                    </Box>
                </Box>
                {users.map(u => (
                    <TradeCard key={u.username} username={u.username} avatarUrl={u.avatarUrl} rating={u.rating} />
                ))}
            </Flex>
        </Box>
    )
};

export default tradePage;