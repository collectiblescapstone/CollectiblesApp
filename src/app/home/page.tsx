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
    const { session, loading: authLoading } = useAuth()
    const userID = session?.user.id

    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!userID || !session?.access_token) {
            setLoading(false)
            return
        }
        const loadUserProfile = async () => {
            try {
                const data = await fetchUserData(userID, session.access_token)
                setUser(data)
                setError(null)
            } catch (err) {
                console.error(err)
                setError('Failed to fetch user data')
            } finally {
                setLoading(false)
            }
        }

        loadUserProfile()
    }, [userID, session?.access_token])

    if (authLoading || loading) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
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
        >
            <Heading
                mt={{ base: 5, lg: 8 }}
                fontSize={{ base: '2xl', lg: '3xl' }}
                textAlign="center"
                fontWeight={'Bold'}
                fontFamily="var(--font-sans)"
                px={1}
            >
                Welcome back {user?.firstName || user?.username}!
            </Heading>

            <Flex
                flexDirection="row"
                w="fit-content"
                maxW="100%"
                mt={{ base: 4, lg: 6 }}
                mx="auto"
                alignSelf="center"
                wrap="wrap"
                justifyContent="space-between"
                alignItems="center"
                px={8}
            >
                <Flex direction="column" alignItems="center" w="25%">
                    <Text
                        fontSize={{ base: '2xl', lg: '4xl' }}
                        fontWeight="bold"
                        color="#5D49C3"
                    >
                        {user.cardsLoggedthisMonth}
                    </Text>
                    <Text
                        fontSize={{ base: 'xs', lg: 'sm' }}
                        color="gray.600"
                        textAlign="center"
                    >
                        cards logged this month
                    </Text>
                </Flex>

                <Flex direction="column" alignItems="center" w="25%">
                    <Text
                        fontSize={{ base: '2xl', lg: '4xl' }}
                        fontWeight="bold"
                        color="#5D49C3"
                    >
                        {user.cardsInCollection}
                    </Text>
                    <Text
                        fontSize={{ base: 'xs', lg: 'sm' }}
                        color="gray.600"
                        textAlign="center"
                    >
                        total cards in collection
                    </Text>
                </Flex>

                <Flex direction="column" alignItems="center" w="25%">
                    <Text
                        fontSize={{ base: '2xl', lg: '4xl' }}
                        fontWeight="bold"
                        color="#5D49C3"
                    >
                        {user.cardsForTrade}
                    </Text>
                    <Text
                        fontSize={{ base: 'xs', lg: 'sm' }}
                        color="gray.600"
                        textAlign="center"
                    >
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
