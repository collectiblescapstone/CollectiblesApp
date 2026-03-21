import { profilePictures } from '@/app/personal-profile/edit-profile/constants'
import { Avatar, Box, Text } from '@chakra-ui/react'
import StarRating from '../profiles/StarRating'

interface UserSearchListProps {
    name: string
    username: string
    profile_pic: number
    rating: number
    rating_count: number
    location: string
}

const UserSearchList = ({
    name,
    username,
    profile_pic,
    rating,
    rating_count,
    location
}: UserSearchListProps) => {
    const trimmedLocation =
        location.length > 20
            ? location.split(',').slice(-3).join(', ')
            : location

    return (
        <Box
            display="flex"
            alignItems="center"
            p={1}
            w="full"
            _hover={{ backgroundColor: 'gray.100', cursor: 'pointer' }}
        >
            <Avatar.Root boxSize="50px" shape="rounded">
                <Avatar.Image
                    objectFit="contain"
                    src={profilePictures[profile_pic].path}
                />
            </Avatar.Root>
            <Box
                display="flex"
                flexDirection="row"
                ml={2}
                w="100%"
                justifyContent="space-between"
            >
                <Box display="flex" flexDirection="column">
                    <Text fontWeight="semibold">{name}</Text>
                    <Text fontSize="sm" color="gray.500">
                        {username}
                    </Text>
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-end"
                >
                    <StarRating rating={rating} ratingCount={rating_count} />
                    <Text fontSize="sm" color="gray.500">
                        {trimmedLocation}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}

export default UserSearchList
