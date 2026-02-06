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
import { UserProfile } from '@/types/personal-profile';
import { useAuth } from '@/context/AuthProvider';
import { useHeader } from '@/context/HeaderProvider';
import { fetchUserProfile } from '@/utils/userIDProfilePuller';

const WishScreen: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const headerContext = useHeader();
  const setProfileID = headerContext?.setProfileID;
  const { session } = useAuth();

  const userID = session?.user.id;

  useEffect(() => {
    if (!userID) {
      setError('No user ID found');
      setLoading(false);
      return;
    }
    const loadUserProfile = async () => {
      try {
        const data = await fetchUserProfile(userID);
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
  }, [userID, setProfileID]);

  const cards =
    user?.wishlist.map((item) => ({
      name: item.card.name,
      image: item.card.image_url,
    })) ?? [];

  if (loading || !session) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
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
              Wish List - {cards.length} Items
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
                src={`${card.image}`}
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

export default WishScreen;
