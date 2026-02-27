'use client'
import { Button, Flex, Heading } from '@chakra-ui/react'
import Link from 'next/link'

export default function Landing() {
    return (
        <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="inherit"
        >
            <Heading>Welcome to Collectibles App!</Heading>
            <Link href="/sign-in">
                <Button
                    backgroundColor="brand.marigold"
                    color="brand.turtoise"
                    mt={4}
                >
                    Go to Login
                </Button>
            </Link>
        </Flex>
    )
}
