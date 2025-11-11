'use client';

import React from 'react';

import { Flex, Icon, Text } from '@chakra-ui/react';
import { FaInstagram, FaTwitter/*, FaFacebook*/ } from 'react-icons/fa';
import { SocialsType } from '@/types/user-profile';

const socials: SocialsType[] = [
  { icon: FaInstagram, handle: '@anneofinstagables'},
  { icon: FaTwitter, handle: '@not_sandra_bullock' },
  // { icon: FaFacebook, handle: '@sandra.smith.anne' },
];

const SocialLinks: React.FC = () => {
    if (socials.length === 0) return null;
  return (
    <Flex 
      flexDirection="row" 
      justifyContent="center" 
      alignItems="center" 
      gap={3}
      wrap={"wrap"}
    >
      {socials.map((social, index) => (
        <Flex
          key={index}
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <Icon as={social.icon} boxSize={4} />
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            {social.handle}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

export default SocialLinks;
