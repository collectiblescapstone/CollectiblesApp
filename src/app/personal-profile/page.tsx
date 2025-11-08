'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import SocialLinks from '@/components/user-profile/social-links';
import Showcase from '@/components/user-profile/showcase';
import TradeList from '@/components/user-profile/trade-list';
import WishList from '@/components/user-profile/wish-list';

import {
  Box,
  Flex,
  Heading,
  Text,
  Icon,
  Button
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiMapPin, FiSettings } from 'react-icons/fi';

const PersonalProfileScreen: React.FC = () => {
    const router = useRouter();

    const editpress = () => {
        router.push('/personal-profile/edit-profile');
    };

  return (
    <Box bg="white" minH="100vh" color="black">
      <Box
        bgImage="url('/user-profile/banner_temp.jpg')"
        bgSize="cover"
        bgPos="center"
        width="100%"
        height="110px"
        position="relative"
        mt={16}
      />
      <Button 
        onClick={editpress} 
        position="absolute" 
        top={28} 
        left={2} 
        zIndex={1} 
        size="sm"
        rounded="sm"
        variant="solid"
        >
            <FiSettings />
      </Button>
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
          <Avatar.Image src="/user-profile/pfp_temp.jpg" />
          <Avatar.Fallback> SA </Avatar.Fallback>
        </Avatar.Root>
        <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
          Sandra Smith Anne
        </Heading>
        <Flex
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <Icon as={FiMapPin} boxSize={4} />
          <Text fontSize="xs" color="gray.600" fontWeight={'semibold'}>
            Toronto, ON
          </Text>
        </Flex>
        <Text fontSize="sm" color="gray.800" textAlign="center" maxW="400px" px={4}>
          Hi there! My name is Sandra and this is the bio I have written! Isn’t the guy who made this page so talented?
        </Text>
        <Flex mt={1}>
          <SocialLinks />
        </Flex>
      </Flex>
      <Showcase />
      <TradeList />
      <WishList />
    </Box>
  );
};

export default PersonalProfileScreen;