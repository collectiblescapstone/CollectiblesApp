'use client';

import React from 'react';

import { Flex, Icon, Text } from '@chakra-ui/react';
import { FaInstagram, FaTwitter } from 'react-icons/fa';

type SocialsType = {
  icon: keyof typeof iconsMap;
  handle: string;
}

const iconsMap: {[key: string]: typeof FaInstagram | typeof FaTwitter} = {
    FaTwitter: FaTwitter,
    FaInstagram: FaInstagram
};

type sociallinks = { items: SocialsType[] };

const SocialLinks: React.FC<sociallinks> = ({ items }) => {
    if (items.length === 0) return null;
  return (
    <Flex 
      flexDirection="row" 
      justifyContent="center" 
      alignItems="center" 
      gap={3}
      wrap={"wrap"}
    >
      {items.map((social) => (
        <Flex
          key={social.handle}
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <Icon as={iconsMap[social.icon]} boxSize={4} />
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            {social.handle}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

export default SocialLinks;
