'use client';

import { Flex, Heading } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { LuStepBack } from 'react-icons/lu';
import { PAGE_HEADINGS } from './constants';
import { useHeader } from '@/context/HeaderProvider';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const context = useHeader();
  const profileId = context?.profileId;

  const isMainPage = useMemo(() => {
    return Object.keys(PAGE_HEADINGS).includes(pathname);
  }, [pathname]);

  const pageHeading = pathname.toLowerCase().includes('profile')
    ? profileId
    : PAGE_HEADINGS[pathname];

  return (
    <Flex
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={999}
      color="brand.turtiose"
      bgColor="brand.marigold"
      w="full"
      minHeight="8dvh"
      flexDir="row"
      alignItems="center"
      justifyContent={isMainPage ? 'center' : 'space-between'}
      px={2}
    >
      {!isMainPage && (
        <LuStepBack
          size={24}
          onClick={() => router.back()}
          role="button"
          aria-label="Go back"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && router.back()
          }
        />
      )}
      <Heading size="lg" fontFamily="var(--font-sans)" color="brand.turtiose">
        {pageHeading}
      </Heading>
    </Flex>
  );
};

export default Header;
