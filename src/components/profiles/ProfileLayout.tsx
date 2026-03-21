import { Avatar, Box, Flex, Heading, Icon, Text } from '@chakra-ui/react'
import WishList from './WishList'
import TradeList from './TradeList'
import Showcase from './Showcase'
import SocialLinks from './SocialLinks'
import { profilePictures } from '@/app/personal-profile/edit-profile/constants'
import { UserProfile } from '@/types/personal-profile'
import { FiMapPin } from 'react-icons/fi'
import React from 'react'
import { useMobileView } from '@/utils/mobileViewFinder'

interface ProfileLayoutProps {
    user: UserProfile
    leftInteractible?: React.ReactNode
    rightInteractible?: React.ReactNode
}

const ProfileLayout = ({
    user,
    leftInteractible,
    rightInteractible
}: ProfileLayoutProps) => (
    <Box bg="white" minH="100vh" color="black" mb={4}>
        <Box
            bgImage="url('/user-profile/banner_temp.jpg')"
            bgSize="cover"
            bgPos="center"
            width="100%"
            height="110px"
            position="relative"
        />
        <Flex
            position="relative"
            width="100%"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={2}
        >
            {leftInteractible && <Box>{leftInteractible}</Box>}
            {rightInteractible && <Box>{rightInteractible}</Box>}
        </Flex>
        <Flex flexDirection="column" alignItems="center" gap={2} px={4}>
            <Avatar.Root boxSize="100px" mt={-20} p={2} background="white">
                <Avatar.Image
                    objectFit="contain"
                    src={
                        profilePictures[user.profile_pic]?.path ??
                        profilePictures[0].path
                    }
                />
            </Avatar.Root>
            {(user.firstName || user.lastName) && (
                <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
                    {user.firstName} {user.lastName}
                </Heading>
            )}
            {user.location && (
                <Flex
                    flexDirection="row"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                >
                    <Icon as={FiMapPin} boxSize={4} />
                    <Text
                        fontSize="xs"
                        color="gray.600"
                        fontWeight={'semibold'}
                    >
                        {user.location}
                    </Text>
                </Flex>
            )}
            {user.bio && (
                <Text
                    fontSize="sm"
                    color="gray.800"
                    textAlign="center"
                    maxW="400px"
                    px={4}
                >
                    {user.bio}
                </Text>
            )}
            <Flex mt={1} px={4}>
                <SocialLinks
                    instagram={user.instagram}
                    x={user.x}
                    facebook={user.facebook}
                    discord={user.discord}
                    whatsapp={user.whatsapp}
                />
            </Flex>
        </Flex>
        <Showcase
            showcaseList={user.showcaseList.map((item) => ({
                name: item.card.name,
                image: item.card.image_url
            }))}
        />
        <TradeList
            type={'personal'}
            username={''}
            tradelist={user.tradeList.map((item) => ({
                name: item.card.name,
                image: item.card.image_url
            }))}
        />
        <WishList
            type={'personal'}
            username={''}
            wishlist={user.wishlist.map((item) => ({
                name: item.card.name,
                image: item.card.image_url
            }))}
        />
    </Box>
)

export default ProfileLayout
