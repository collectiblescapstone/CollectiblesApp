'use client';

import { Flex, Heading } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { LuStepBack } from 'react-icons/lu';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const mainPages = ['/', '/pokemon-grid', '/camera', '/personal-profile'];

  const isMainPage = useMemo(() => {
    return mainPages.includes(pathname);
  }, [pathname]);

  return (
    <Flex
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={999}
      color="white"
      bgColor="purple.600"
      minHeight="8dvh"
      flexDir="row"
      alignItems="center"
      justifyContent={isMainPage ? 'center' : 'space-between'}
      px={2}
    >
      {!isMainPage && <LuStepBack size={24} onClick={() => router.back()} />}
      {isMainPage && <Heading size="lg">Collectibles App</Heading>}
      {!isMainPage && <Heading size="md">Collectibles App</Heading>}
    </Flex>
  );
};

export default Header;
