'use client'

// React
import React from 'react'

// Chakra UI
import { Box, Heading, VStack } from '@chakra-ui/react'

// Child Components
import { Logo } from '@/components/logo/Logo'

const TitleLogo = () => {
    return (
        <VStack pb={2}>
            <Box display="flex" justifyContent="center">
                <Logo
                    data-testid="logo"
                    style={{
                        color: '#F2C75C',
                        width: '50%',
                        height: '50%'
                    }}
                />
            </Box>
            <Heading size="5xl" color="brand.turtoise">
                Kollec
            </Heading>
        </VStack>
    )
}

export default TitleLogo
