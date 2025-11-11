'use client';

import { Flex, Heading } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { LuCamera, LuLibrary, LuUser } from 'react-icons/lu';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: { icon: React.ReactNode; path: string; name: string }[] = [
    {
      icon: <LuLibrary size={36} />,
      path: '/collections',
      name: 'Collections',
    },
    { icon: <LuCamera size={36} />, path: '/camera', name: 'Camera' },
    { icon: <LuUser size={36} />, path: '/profile', name: 'Profile' },
  ];

  return (
    <Flex
      color="white"
      background="purple.600"
      minWidth="25dvw"
      minHeight="dvh"
      flexDir="column"
      alignItems="flex-start"
      p={8}
    >
      <Heading size="2xl" mb={16}>
        Collectibles App
      </Heading>
      {menuItems.map((item) => (
        <Flex
          key={item.path}
          onClick={() => router.push(item.path)}
          bgColor={
            pathname.includes(item.path) ? 'whiteAlpha.400' : 'transparent'
          }
          padding={2}
          borderRadius={8}
          flexDir="row"
          cursor="pointer"
          width="100%"
          mb={5}
        >
          {item.icon}
          <Heading size="2xl" ml={4}>
            {item.name}
          </Heading>
        </Flex>
      ))}
    </Flex>
  );
};

export default Sidebar;
