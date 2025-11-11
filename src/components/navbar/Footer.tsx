'use client';

import { Box, Flex } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { LuCamera, LuLibrary, LuUser } from 'react-icons/lu';

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Flex
      color="white"
      background="purple.600"
      minHeight="8dvh"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      flexDir="row"
      alignItems="center"
      justifyContent="space-between"
      px={16}
    >
      <Box
        onClick={() => router.push('/collections')}
        bgColor={
          pathname.includes('/collections') ? 'whiteAlpha.300' : 'transparent'
        }
      >
        <LuLibrary size={36} />
      </Box>
      <Box
        onClick={() => router.push('/camera')}
        bgColor={
          pathname.includes('/camera') ? 'whiteAlpha.300' : 'transparent'
        }
      >
        <LuCamera size={36} />
      </Box>
      <Box
        onClick={() => router.push('/profile')}
        bgColor={
          pathname.includes('/profile') ? 'whiteAlpha.300' : 'transparent'
        }
      >
        <LuUser size={36} />
      </Box>
    </Flex>
  );
};

export default Footer;
