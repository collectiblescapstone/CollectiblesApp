import type { Metadata } from 'next'
import './globals.css'
import { ChakraUIProvider } from '@/context/ChakraUIProvider'
import { AuthContextProvider } from '@/context/AuthProvider'
import { HeaderProvider } from '@/context/HeaderProvider'
import Content from './content'
import { Suspense } from 'react'
import { Spinner } from '@chakra-ui/react'
import { ProfileSelectionProvider } from '@/context/ProfileSelectionProvider'
import { PokemonCardsProvider } from '@/context/PokemonCardsProvider'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
    title: 'Kollec',
    description: 'Card Collectibles Application'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`antialiased`}>
                <HeaderProvider>
                    <ChakraUIProvider>
                        <AuthContextProvider>
                            <ProfileSelectionProvider>
                                <PokemonCardsProvider>
                                    <Suspense fallback={<Spinner size="xl" />}>
                                        <Content>
                                            {children}
                                            <SpeedInsights />
                                        </Content>
                                    </Suspense>
                                </PokemonCardsProvider>
                            </ProfileSelectionProvider>
                        </AuthContextProvider>
                    </ChakraUIProvider>
                </HeaderProvider>
            </body>
        </html>
    )
}
