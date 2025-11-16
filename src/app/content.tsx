'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/navbar/Header';
import { Box, Flex } from '@chakra-ui/react';
import Footer from '@/components/navbar/Footer';
import { Capacitor } from '@capacitor/core';
import Sidebar from '@/components/navbar/Sidebar';

export const CHAKRA_UI_LG_BREAKPOINT = 992;

const Content = ({ children }: { children: React.ReactNode }) => {
  const [isMobileView, setIsMobileView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return (
      Capacitor.isNativePlatform() ||
      window.innerWidth <= CHAKRA_UI_LG_BREAKPOINT
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const innerWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
      setIsMobileView(
        Capacitor.isNativePlatform() || innerWidth <= CHAKRA_UI_LG_BREAKPOINT
      );
    };
    handleResize();

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
      <Flex minWidth="75dvw" minHeight="dvh" justifyContent="center">
        <Box maxWidth="40dvw">{children}</Box>
      </Flex>
    </Flex>
  );
};

export default Content;
