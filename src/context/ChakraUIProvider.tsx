'use client'

import * as React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

export function ChakraUIProvider({ children }: { children: React.ReactNode }) {
    const config = defineConfig({
        theme: {
            tokens: {
                colors: {
                    brand: {
                        marigold: { value: '#F2C75C' },
                        turtoise: { value: '#003B49' },
                        marigoldAlpha: { value: 'rgba(242, 199, 92, 0.7)' }
                    }
                }
            }
        }
    })
    const system = createSystem(defaultConfig, config)

    return <ChakraProvider value={system}>{children}</ChakraProvider>
}
