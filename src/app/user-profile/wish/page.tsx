'use client';

import React, { useEffect, useState } from 'react';

import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { PokemonCardImage } from '@/types/personal-profile';
import { useSearchParams } from 'next/navigation';
import { UserProfile } from '@/types/personal-profile';

const WishScreen: React.FC = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = searchParams.get('userID');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/profiles?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        setUser(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const cards = user?.wishlist.map((item) => ({
    name: item.card.name,
    image: item.card.image_url,
  })) as PokemonCardImage[];

  if (loading) {
    return <Text>Loading...</Text>;
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
            <Avatar.Fallback> SA </Avatar.Fallback>
          </Avatar.Root>
          <Flex
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            gap={2}
          >
            <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
              {user?.firstName} {user?.lastName}
            </Heading>
            <Text fontSize="md" color="gray.600" fontWeight={'semibold'}>
              Wish List - {cards.length} Items
            </Text>
          </Flex>
        </Flex>
        <Flex justifyContent="center" alignItems="center" mt={-4}>
          <Box height="2px" width="90%" bg="gray.500" mt={5} />
        </Flex>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          wrap="wrap"
          gap={7}
        >
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
        </Flex>
      </Flex>
    </Box>
  );
};

export default WishScreen;
