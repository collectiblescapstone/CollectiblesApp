'use client';

import React, { useEffect, useState } from 'react';

import {
  Avatar,
  Card,
  Flex,
  HStack,
  Stack,
  Text,
  Box,
  Heading,
  Slider,
} from '@chakra-ui/react';
import TradingCards from '@/components/trading/TradingCards';
import { useAuth } from '@/context/AuthProvider';
import { LuStar } from 'react-icons/lu';
import { CapacitorHttp } from '@capacitor/core';
import { baseUrl } from '@/utils/constants';
import { pfp_image_mapping } from '../personal-profile/edit-profile/constants';

type TradeCardProps = {
  username: string;
  avatarUrl?: string;
  rating: number;
};

type ViableOption = {
  card: { id: string; name: string; image_url: string };
  users: {
    id: string;
    username: string | null;
    profile_pic: number;
    longitude: number | null;
    latitude: number | null;
  }[];
};

const TradeCard: React.FC<TradeCardProps> = ({
  username,
  avatarUrl,
  rating,
}) => {
  return (
    <Card.Root width="80%">
      <Card.Body>
        <TradingCards />
      </Card.Body>
      <Card.Footer>
        <HStack mb="0" gap="3">
          <Avatar.Root>
            <Avatar.Image
              src={
                avatarUrl ??
                'https://images.unsplash.com/photo-1511806754518-53bada35f930'
              }
            />
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
                  const color =
                    rating <= 2.5
                      ? '#ff3b30'
                      : rating < 4.0
                        ? '#ffd60a'
                        : rating < 5
                          ? '#32d74b'
                          : '#08a9c6';
                  return <LuStar color={color} size={20} />;
                })()}
              </Box>
              <Text fontSize="sm" fontWeight="semibold">
                {Number.isFinite(rating) ? rating.toFixed(1) : '-'}
              </Text>
            </HStack>
          </Stack>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
};

const TradePage = () => {
  const { session } = useAuth();
  const userID = session?.user.id;

  const [users, setUsers] = useState<TradeCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userID) {
      setError('No user ID found');
      setLoading(false);
      return;
    }

    const loadViableOptions = async () => {
      try {
        const response = await CapacitorHttp.post({
          url: `${baseUrl}/api/get-viable-options`,
          data: { userID },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const viableOptions =
          (response.data?.viableOptions as ViableOption[] | undefined) ?? [];

        const userMap = new Map<string, TradeCardProps>();
        for (const option of viableOptions) {
          for (const user of option.users) {
            if (!userMap.has(user.id)) {
              userMap.set(user.id, {
                username: user.username ?? 'Unknown User',
                avatarUrl: pfp_image_mapping[user.profile_pic],
                rating: 0,
              });
            }
          }
        }

        setUsers(Array.from(userMap.values()));
        setError(null);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch viable options');
      } finally {
        setLoading(false);
      }
    };

    loadViableOptions();
  }, [userID]);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh">
        <Text>{error}</Text>
      </Flex>
    );
  }

  return (
    <Box bg="white" minH="100vh" color="black" mb={4}>
      <Flex flexDirection="column" alignItems="center" gap={2}>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        ></Flex>
        <Box w="100%" position="relative" px={4}>
          <Heading
            mt={1}
            fontSize="2xl"
            textAlign="center"
            fontWeight={'Bold'}
            fontFamily="var(--font-sans)"
            maxW="container.md"
            mx="auto"
          >
            TradePost
          </Heading>

          <Box
            position="absolute"
            right={4}
            top="50%"
            transform="translateY(-50%)"
          >
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
        {users.map((u) => (
          <TradeCard
            key={u.username}
            username={u.username}
            avatarUrl={u.avatarUrl}
            rating={u.rating}
          />
        ))}
      </Flex>
    </Box>
  );
};

export default TradePage;
