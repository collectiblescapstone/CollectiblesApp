'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'

import PopularCards from '@/components/home/PopularCards'
import Collection from '@/components/home/Collection'
import TradeSuggestions from '@/components/home/TradeSuggestions'

import { Box, Flex, Heading, Text, Spinner } from '@chakra-ui/react'
import { UserData } from '@/types/user-data'
import { fetchUserData } from '@/utils/userDataPuller'

const HomePage = () => {
    const { session } = useAuth()

    const userID = session?.user.id

    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!userID) {
            setError('No user ID found')
            setLoading(false)
            return
        }
        const loadUserProfile = async () => {
            try {
                const data = await fetchUserData(userID)
                setUser(data)
                setLoading(false)
            } catch (error) {
                console.error(error)
                setError('Failed to fetch user data')
            } finally {
                setLoading(false)
            }
        }
        loadUserProfile()
    }, [userID])

    if (loading || !session) {
        return (
            <Box textAlign="center" mt={10}>
                Loading... <Spinner size="xl" />
            </Box>
        )
    }

    if (error) {
        return (
            <Flex justifyContent="center" alignItems="center" height="50vh">
                <Text>{error}</Text>
            </Flex>
        )
    }

    if (!user) {
        return (
            <Flex justifyContent="center" alignItems="center" height="50vh">
                <Text>User not found</Text>
            </Flex>
        )
    }

    return (
        <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="inherit"
        >
            <Heading
                mt={5}
                fontSize="2xl"
                textAlign="center"
                fontWeight={'Bold'}
                fontFamily="var(--font-sans)"
                px={1}
            >
                Welcome back {user?.firstName || user?.username}!
            </Heading>

            <Flex
                mt={4}
                px={4}
                w="100%"
                justifyContent="space-around"
                flexWrap="wrap"
                gap={6}
            >
                <Flex direction="column" alignItems="center" minW="180px">
                    <Text fontSize="2xl" fontWeight="bold">
                        {user.cardsLoggedthisMonth}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        cards logged this month
                    </Text>
                </Flex>

                <Flex direction="column" alignItems="center" minW="180px">
                    <Text fontSize="2xl" fontWeight="bold">
                        {user.cardsInCollection}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        total cards in collection
                    </Text>
                </Flex>

                <Flex direction="column" alignItems="center" minW="180px">
                    <Text fontSize="2xl" fontWeight="bold">
                        {user.cardsForTrade}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        cards up for trade
                    </Text>
                </Flex>
            </Flex>

            <PopularCards
                cards={user.popularCards.map((card) => ({
                    name: card.name,
                    imageUrl: card.imageUrl,
                    count: card.count
                }))}
            />
            <Collection
                cards={user.recentCards.map((card) => ({
                    name: card.name,
                    image: card.imageUrl
                }))}
            />
            <TradeSuggestions />
        </Flex>
    )
}

export default HomePage
