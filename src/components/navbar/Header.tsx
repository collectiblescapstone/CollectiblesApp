'use client';

import { Flex, Heading } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { LuStepBack } from 'react-icons/lu';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isMainPage = useMemo(() => {
    return ['/'].includes(pathname);
  }, [pathname]);

  return (
    <Flex
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
