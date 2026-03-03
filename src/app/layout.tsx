import type { Metadata } from 'next'
import './globals.css'
import { ChakraUIProvider } from '@/context/ChakraUIProvider'
import { AuthContextProvider } from '@/context/AuthProvider'
import { HeaderProvider } from '@/context/HeaderProvider'
import Content from './content'
import { Suspense } from 'react'
import { Spinner } from '@chakra-ui/react'
import { ProfileSelectionProvider } from '@/context/ProfileSelectionProvider'

export const metadata: Metadata = {
    title: 'Collectibles App',
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
                                <Suspense fallback={<Spinner size="xl" />}>
                                    <Content>{children}</Content>
                                </Suspense>
                            </ProfileSelectionProvider>
                        </AuthContextProvider>
                    </ChakraUIProvider>
                </HeaderProvider>
            </body>
        </html>
    )
}
