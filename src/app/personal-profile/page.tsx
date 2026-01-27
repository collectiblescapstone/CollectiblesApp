'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderProvider';

import SocialLinks from '@/components/user-profile/SocialLinks';
import Showcase from '@/components/user-profile/Showcase';
import TradeList from '@/components/user-profile/TradeList';
import WishList from '@/components/user-profile/WishList';

import { Box, Flex, Heading, Text, Icon, Button } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiMapPin, FiEdit3 } from 'react-icons/fi';

const PersonalProfileScreen: React.FC = () => {
  const router = useRouter();
  const headerContext = useHeader();
  const setProfileID = headerContext?.setProfileID;

  const editpress = () => {
    router.push('/personal-profile/edit-profile');
  };

  useEffect(() => {
    if (setProfileID) {
      setProfileID('smithsonian_collection');
    }
  }, [setProfileID]);

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
        left={2}
        zIndex={1}
        size="sm"
        rounded="sm"
        variant="solid"
      >
        <FiEdit3 />
      </Button>
      <Flex flexDirection="column" alignItems="center" gap={2}>
        <Avatar.Root boxSize="100px" shape="rounded" mt={-20}>
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
        <Text
          fontSize="sm"
          color="gray.800"
          textAlign="center"
          maxW="400px"
          px={4}
        >
          Hi there! My name is Sandra and this is the bio I have written! Isn’t
          the guy who made this page so talented?
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
