'use client';

import { Box, Flex } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { LuCamera, LuLibrary, LuUser } from 'react-icons/lu';

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: { icon: React.ReactNode; path: string }[] = [
    { icon: <LuLibrary size={36} />, path: '/collections' },
    { icon: <LuCamera size={36} />, path: '/camera' },
    { icon: <LuUser size={36} />, path: '/profile' },
  ];

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
      {menuItems.map((item) => (
        <Box
          key={item.path}
          onClick={() => router.push(item.path)}
          bgColor={
            pathname.includes(item.path) ? 'whiteAlpha.400' : 'transparent'
          }
          padding={2}
          borderRadius={8}
          cursor="pointer"
        >
          {item.icon}
        </Box>
      ))}
    </Flex>
  );
};

export default Footer;
