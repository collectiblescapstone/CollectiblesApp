import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ChakraUIProvider } from '@/context/ChakraUIProvider';
import { AuthContextProvider } from '@/context/AuthProvider';
import Header from '@/components/navbar/Header';
import { Box } from '@chakra-ui/react';
import Footer from '@/components/navbar/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Collectibles App',
  description: 'Card Collectibles Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChakraUIProvider>
          <AuthContextProvider>
            <Header />
            <Box minHeight="84dvh">{children}</Box>
            <Footer />
          </AuthContextProvider>
        </ChakraUIProvider>
      </body>
    </html>
  );
}
