'use client'

import React, { useEffect, useState } from 'react'

import { Flex, Text, Spinner } from '@chakra-ui/react'
import { UserProfile } from '@/types/personal-profile'
import { fetchUserProfile } from '@/utils/profiles/userNameProfilePuller'
import { useHeader } from '@/context/HeaderProvider'
import { useProfileSelected } from '@/context/ProfileSelectionProvider'
import ProfileListLayout from '@/components/profiles/ProfileListLayout'

const WishScreen: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const { setProfileID } = useHeader()
    const { profileSelected: userName } = useProfileSelected()

    useEffect(() => {
        if (!userName) {
            setError('No user name found')
            setLoading(false)
            return
        }
        const loadUserProfile = async () => {
            try {
                const data = await fetchUserProfile(userName)
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
    }, [userName, setProfileID])

    const cards =
        user?.wishlist.map((item) => ({
            name: item.card.name,
            image: item.card.image_url
        })) ?? []

    if (loading) {
        return (
            <Flex
                justifyContent="center"
                alignItems="center"
                height="50vh"
                gap={3}
            >
                <Spinner color="black" />
                <Text>Loading...</Text>
            </Flex>
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

    return <ProfileListLayout user={user} cards={cards} type="wish" />
}

export default WishScreen
