'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderProvider';
import { useAuth } from '@/context/AuthProvider';

import SocialLinks from '@/components/user-profile/SocialLinks';
import Showcase from '@/components/user-profile/Showcase';
import TradeList from '@/components/user-profile/TradeList';
import WishList from '@/components/user-profile/WishList';
import { UserProfile } from '@/types/personal-profile';

import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiMapPin, FiEdit3 } from 'react-icons/fi';

const PersonalProfileScreen: React.FC = () => {
  const router = useRouter();
  const headerContext = useHeader();
  const setProfileID = headerContext?.setProfileID;
  const { session } = useAuth();

  // This is a temporary userID for testing purposes.
  // Change the specific userID to match the profile you have in your local database.
  const tempUserID = session?.user.id ?? '052d7fdf-d30c-4606-a0dc-621b8f27c57b';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const editpress = () => {
    router.push('/personal-profile/edit-profile');
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          `/api/get-user-by-userID?userID=${tempUserID}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        setUser(data);
        if (setProfileID) {
          setProfileID(data.username);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [tempUserID, setProfileID]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh" gap={3}>
        <Spinner color="black" />
        <Text>Loading...</Text>
      </Flex>
    );
  }

  if (!user) {
    return <Text>User not found</Text>;
  }

  return (
    <Box bg="white" minH="100vh" color="black" mb={4}>
      <Box
        bgImage="url('/user-profile/banner_temp.jpg')"
        bgSize="cover"
        bgPos="center"
        width="100%"
        height="110px"
        position="relative"
      />
      <Button
        onClick={editpress}
        position="relative"
        top={3}
        zIndex={1}
        size="lg"
        rounded="sm"
        variant="solid"
        bg="white"
        color="black"
      >
        <FiEdit3 />
      </Button>
      <Flex flexDirection="column" alignItems="center" gap={2} px={4}>
        <Avatar.Root boxSize="100px" shape="rounded" mt={-20}>
          <Avatar.Image src="/user-profile/pfp_temp.jpg" />
        </Avatar.Root>
        <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
          {user.firstName} {user.lastName}
        </Heading>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <Icon as={FiMapPin} boxSize={4} />
          <Text fontSize="xs" color="gray.600" fontWeight={'semibold'}>
            {user.location}
          </Text>
        </Flex>
        <Text
          fontSize="sm"
          color="gray.800"
          textAlign="center"
          maxW="400px"
          px={4}
        >
          {user.bio}
        </Text>
        <Flex mt={1} px={4}>
          <SocialLinks
            instagram={user.instagram}
            twitter={user.twitter}
            facebook={user.facebook}
          />
        </Flex>
      </Flex>
      <Showcase />
      <TradeList />
      <WishList
        type={'personal'}
        username={''}
        wishlist={user.wishlist.map((item) => ({
          name: item.card.name,
          image: item.card.image_url,
        }))}
      />
    </Box>
  );
};

export default PersonalProfileScreen;
