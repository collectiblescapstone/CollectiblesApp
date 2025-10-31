'use client';

import React from 'react';

import SocialLinks from '@/components/user-profile/social-links';

import {
  Box,
  Flex,
  Stack,
  HStack,
  VStack,
  IconButton,
  Link,
  Button,
  SimpleGrid,
  Image,
  Heading,
  Text,
  Icon
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';

const ProfileScreen: React.FC = () => {
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
          <Avatar.Image src="user-profile/pfp_temp.jpg" />
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
        <Box height="1px" width="93%" bg="gray.500" mt={5}/>
      </Flex>
    </Box>
  );
};

export default ProfileScreen;