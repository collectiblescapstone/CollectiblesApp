'use client';

import React, { useEffect, useState } from 'react';

import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { PokemonCardImage } from '@/types/personal-profile';
import { useSearchParams } from 'next/navigation';
import { UserProfile } from '@/types/personal-profile';
import { fetchUserProfile } from '@/utils/profiles/userNameProfilePuller';
import { useHeader } from '@/context/HeaderProvider';

const TradeScreen: React.FC = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userName = searchParams.get('username');
  const { setProfileID } = useHeader();

  useEffect(() => {
    if (!userName) {
      setError('No user name found');
      setLoading(false);
      return;
    }
    const loadUserProfile = async () => {
      try {
        const data = await fetchUserProfile(userName);
        setUser(data);
        setLoading(false);
        if (setProfileID) {
          setProfileID(data.username);
        }
      } catch (error) {
        console.error(error);
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userName, setProfileID]);

  const cards =
    user?.tradeList.map((item) => ({
      name: item.card.name,
      image: item.card.image_url,
    })) ?? [];

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh" gap={3}>
        <Spinner color="black" />
        <Text>Loading...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh">
        <Text>{error}</Text>
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh">
        <Text>User not found</Text>
      </Flex>
    );
  }

  return (
    <Box bg="white" minH="100vh" color="black">
      <Flex flexDirection="column" gap={6} mt={4}>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          px={4}
          gap={4}
        >
          <Avatar.Root boxSize="75px" shape="rounded">
            <Avatar.Image src="/user-profile/pfp_temp.jpg" />
          </Avatar.Root>
          <Flex
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            gap={2}
          >
            {user.firstName || user.lastName ? (
              <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
                {user?.firstName} {user?.lastName}
              </Heading>
            ) : (
              <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
                {user?.username}
              </Heading>
            )}
            <Text fontSize="md" color="gray.600" fontWeight={'semibold'}>
              Trade List - {cards.length} Items
            </Text>
          </Flex>
        </Flex>
        <Flex justifyContent="center" alignItems="center" mt={-4}>
          <Box height="2px" width="90%" bg="gray.600" mt={5} />
        </Flex>
        <SimpleGrid columns={{ base: 3 }} w="100%" gap={10} px={6}>
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
        </SimpleGrid>
      </Flex>
    </Box>
  );
};

export default TradeScreen;
