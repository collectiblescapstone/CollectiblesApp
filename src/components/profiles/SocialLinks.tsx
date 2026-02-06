'use client';

import React from 'react';

import { Flex, Icon, Text } from '@chakra-ui/react';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';
import { SocialsType } from '@/types/user-profile';

interface SocialLinksProps {
  instagram?: string;
  twitter?: string;
  facebook?: string;
}

const SocialLinks = ({ instagram, twitter, facebook }: SocialLinksProps) => {
  const socials: SocialsType[] = [
    instagram && { icon: FaInstagram, handle: instagram },
    twitter && { icon: FaTwitter, handle: twitter },
    facebook && { icon: FaFacebook, handle: facebook },
  ].filter(Boolean) as SocialsType[];

  if (socials.length === 0) {
    return null;
  }

  return (
    <Flex
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      gap={3}
      wrap={'wrap'}
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
          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
            {social.handle}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

export default SocialLinks;
