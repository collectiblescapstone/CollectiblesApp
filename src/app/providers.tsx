'use client';

import * as React from 'react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
