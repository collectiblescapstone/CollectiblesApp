'use client';

import React, { useEffect, useState } from 'react';
import { useHeader } from '@/context/HeaderProvider';

import SocialLinks from '@/components/user-profile/SocialLinks';
import Showcase from '@/components/user-profile/Showcase';
import TradeList from '@/components/user-profile/TradeList';
import WishList from '@/components/user-profile/WishList';
import AccountOptions from '@/components/user-profile/AccountOptions';
import { UserProfile } from '@/types/personal-profile';

import { Box, Flex, Heading, Text, Icon, Spinner } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';

const ProfileScreen = ({ username }: { username: string }) => {
  const headerContext = useHeader();
  const setProfileID = headerContext?.setProfileID;

  // This is a temporary username for testing purposes.
  const tempUsername = username ?? 'Habibi_George_Bush';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          `/api/get-user-by-username?username=${tempUsername}`
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
  }, [tempUsername, setProfileID]);

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
      <AccountOptions />
      <Flex flexDirection="column" alignItems="center" gap={2}>
        <Avatar.Root boxSize="100px" shape="rounded" mt={-20}>
          <Avatar.Image src="/user-profile/pfp_temp.jpg" />
          <Avatar.Fallback> SA </Avatar.Fallback>
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
        <Flex mt={1}>
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
        type={'user'}
        username={tempUsername}
        wishlist={user.wishlist.map((item) => ({
          name: item.card.name,
          image: item.card.image_url,
        }))}
      />
    </Box>
  );
};

export default ProfileScreen;
