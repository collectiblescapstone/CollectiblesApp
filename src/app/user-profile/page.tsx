'use client';

import React, { useEffect, useState } from 'react';
import { useHeader } from '@/context/HeaderProvider';

import SocialLinks from '@/components/profiles/SocialLinks';
import Showcase from '@/components/profiles/Showcase';
import TradeList from '@/components/profiles/TradeList';
import WishList from '@/components/profiles/WishList';
import AccountOptions from '@/components/profiles/AccountOptions';
import { UserProfile } from '@/types/personal-profile';

import { Box, Flex, Heading, Text, Icon, Spinner } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';
import { fetchUserProfile } from '@/utils/profiles/userNameProfilePuller';

interface userNameProps {
  username: string;
}

const ProfileScreen = ({ username }: userNameProps) => {
  const headerContext = useHeader();
  const setProfileID = headerContext?.setProfileID;

  // This is a temporary username for testing purposes.
  // Change the specific username to match the profile you have in your local database.
  const userName = username ?? 'habibi_george_bush';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        if (setProfileID) {
          setProfileID(data.username);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userName, setProfileID]);

  if (loading) {
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
        </Avatar.Root>
        {(user.firstName || user.lastName) && (
          <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
            {user.firstName} {user.lastName}
          </Heading>
        )}
        {user.location && (
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
        )}
        {user.bio && (
          <Text
            fontSize="sm"
            color="gray.800"
            textAlign="center"
            maxW="400px"
            px={4}
          >
            {user.bio}
          </Text>
        )}
        <Flex mt={1} px={4}>
          <SocialLinks
            instagram={user.instagram}
            x={user.x}
            facebook={user.facebook}
            discord={user.discord}
            whatsapp={user.whatsapp}
          />
        </Flex>
      </Flex>
      <Showcase
        showcaseList={user.showcaseList.map((item) => ({
          name: item.card.name,
          image: item.card.image_url,
        }))}
      />
      <TradeList
        type={'user'}
        username={userName}
        tradelist={user.tradeList.map((item) => ({
          name: item.card.name,
          image: item.card.image_url,
        }))}
      />
      <WishList
        type={'user'}
        username={userName}
        wishlist={user.wishlist.map((item) => ({
          name: item.card.name,
          image: item.card.image_url,
        }))}
      />
    </Box>
  );
};

export default ProfileScreen;
