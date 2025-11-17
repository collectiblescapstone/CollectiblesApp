'use client';

import { Flex, Heading } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { MENU_ITEMS } from './constants';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

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
      {MENU_ITEMS.map((item) => (
        <Flex
          key={item.path}
          onClick={() =>
            item.onClick ? item.onClick() : router.push(item.path)
          }
          bgColor={
            pathname.startsWith(`${item.path}`)
              ? 'whiteAlpha.400'
              : 'transparent'
          }
          padding={2}
          borderRadius={8}
          flexDir="row"
          cursor="pointer"
          width="100%"
          mb={5}
          role="button"
          aria-label={`Navigate to ${item.name}`}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && item.onClick
              ? item.onClick()
              : router.push(item.path)
          }
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
