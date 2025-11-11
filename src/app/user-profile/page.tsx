'use client';

import React from 'react';
import { useState, useEffect } from 'react';

import SocialLinks from '@/components/user-profile/social-links';
import Showcase from '@/components/user-profile/showcase';
import TradeList from '@/components/user-profile/trade-list';
import WishList from '@/components/user-profile/wish-list';
import AccountOptions from '@/components/user-profile/accountoptions';

import {
  Box,
  Flex,
  Heading,
  Text,
  Icon
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';

type UserData = {
  username: string;
  name: string;
  location: string;
  bio: string;
  profilePictureUrl: string;
  bannerImageUrl: string;
  socialLinks: SocialsType[];
  showcaseItems: Card[];
  tradeListItems: Card[];
  wishListItems: Card[];
};

type Card = {
  id: string;
  title: string;
  image: string;
};

type SocialsType = {
  icon: 'FaInstagram' | 'FaTwitter';
  handle: string;
}

const ProfileScreen: React.FC = () => {

  const UserDataStructure: UserData = {
    username: '',
    name: '',
    location: '',
    bio: '',
    profilePictureUrl: '',  
    bannerImageUrl: '',
    socialLinks: [],
    showcaseItems: [],
    tradeListItems: [],
    wishListItems: [],
  };

  const [data, setData] = useState<UserData>(UserDataStructure);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const username = "smithsonian_collection"
        const response = await fetch(`/user-profile/temp_data/${username}.json`);
        if (!response.ok) {
            console.error('Failed to fetch user data');
            setLoading(false);
            return;
        }
        const result = await response.json();
        setData(result);
        setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box bg="white" minH="100vh" color="black">
      <Box
        bgImage={`url(${data.bannerImageUrl})`}
        bgSize="cover"
        bgPos="center"
        width="100%"
        height="110px"
        position="relative"
        mt={16}
      />
      <AccountOptions />
      <Flex
        flexDirection="column"
        alignItems="center"
        gap={2}
      >
        <Avatar.Root
          boxSize="100px"
          shape="rounded"
          mt={-20}
        >
          <Avatar.Image src={data.profilePictureUrl} />
          <Avatar.Fallback> SA </Avatar.Fallback>
        </Avatar.Root>
        <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
          {data.name}
        </Heading>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <Icon as={FiMapPin} boxSize={4} />
          <Text fontSize="xs" color="gray.600" fontWeight={'semibold'}>
            {data.location}
          </Text>
        </Flex>
        <Text fontSize="sm" color="gray.800" textAlign="center" maxW="400px" px={4}>
          {data.bio}
        </Text>
        <Flex mt={1}>
          <SocialLinks items={data.socialLinks} />
        </Flex>
      </Flex>
      <Showcase items={data.showcaseItems} />
      <TradeList items={data.tradeListItems} />
      <WishList items={data.wishListItems} />
    </Box>
  );
};

export default ProfileScreen;