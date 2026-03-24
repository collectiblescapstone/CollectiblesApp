'use client'

import React, { useEffect, useState } from 'react'

import { Box, Flex, Text, Spinner } from '@chakra-ui/react'
import { UserProfile } from '@/types/personal-profile'
import { useAuth } from '@/context/AuthProvider'
import { useHeader } from '@/context/HeaderProvider'
import { fetchUserProfile } from '@/utils/profiles/userIDProfilePuller'
import ProfileListLayout from '@/components/profiles/ProfileListLayout'

const TradeScreen: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const { setProfileID } = useHeader()
    const { session } = useAuth()
    const userID = session?.user.id

    useEffect(() => {
        if (!userID) {
            setError('No user ID found')
            setLoading(false)
            return
        }
        const loadUserProfile = async () => {
            try {
                const data = await fetchUserProfile(userID)
                setUser(data)
                setLoading(false)
                if (setProfileID) {
                    setProfileID(data.username)
                }
            } catch (error) {
                console.error(error)
                setError('Failed to fetch user profile')
            } finally {
                setLoading(false)
            }
        }

        loadUserProfile()
    }, [userID, setProfileID])

    const cards =
        user?.tradeList.map((item) => ({
            name: item.card.name,
            image: item.card.image_url
        })) ?? []

    if (loading || !session) {
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

    return <ProfileListLayout user={user} cards={cards} type="trade" />
}

export default TradeScreen
