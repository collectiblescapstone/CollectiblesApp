'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderProvider';

import SocialLinks from '@/components/profiles/SocialLinks';
import Showcase from '@/components/profiles/Showcase';
import TradeList from '@/components/profiles/TradeList';
import WishList from '@/components/profiles/WishList';
import { UserProfile } from '@/types/personal-profile';
import { fetchUserProfile } from '@/utils/profiles/userIDProfilePuller';

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
import { useAuth } from '@/context/AuthProvider';

const PersonalProfileScreen: React.FC = () => {
  const router = useRouter();
  const headerContext = useHeader();
  const setProfileID = headerContext?.setProfileID;
  const { session } = useAuth();

  const userID = session?.user.id;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const editpress = () => {
    router.push('/personal-profile/edit-profile');
  };

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
  }, [userID, setProfileID]);

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

  if (loading || !session) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
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
        {user.firstName ||
          (user.lastName && (
            <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
              {user.firstName} {user.lastName}
            </Heading>
          ))}
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
            twitter={user.twitter}
            facebook={user.facebook}
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
        type={'personal'}
        username={''}
        tradelist={user.tradeList.map((item) => ({
          name: item.card.name,
          image: item.card.image_url,
        }))}
      />
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
