'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/navbar/Header';
import { Box, Flex } from '@chakra-ui/react';
import Footer from '@/components/navbar/Footer';
import { Capacitor } from '@capacitor/core';
import Sidebar from '@/components/navbar/Sidebar';

const Content = ({ children }: { children: React.ReactNode }) => {
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const innerWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
      setIsMobileView(Capacitor.isNativePlatform() || innerWidth <= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobileView ? (
    <>
      <Header />
      <Box minHeight="84dvh">{children}</Box>
      <Footer />
    </>
  ) : (
    <Flex flexDirection="row">
      <Sidebar />
      <Box minWidth="75dvw" minHeight="dvh">
        {children}
      </Box>
    </Flex>
  );
};

export default Content;
