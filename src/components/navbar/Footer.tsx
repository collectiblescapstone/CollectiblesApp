'use client';

import { Box, Flex } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { MENU_ITEMS } from './constants';

const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Flex
      color="white"
      background="purple.600"
      minHeight="8dvh"
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      flexDir="row"
      alignItems="center"
      justifyContent="space-between"
      px={16}
    >
      {MENU_ITEMS.map((item) => (
        <Box
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
          cursor="pointer"
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
        </Box>
      ))}
    </Flex>
  );
};

export default Footer;
