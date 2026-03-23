import { profilePictures } from '@/app/personal-profile/edit-profile/constants'
import { PokemonCardImage, UserProfile } from '@/types/personal-profile'
import {
    Avatar,
    Box,
    Flex,
    Heading,
    SimpleGrid,
    Text,
    Image
} from '@chakra-ui/react'
import { useMemo } from 'react'

const ProfileWishlistLayout = ({ user }: { user: UserProfile }) => {
    const cards = useMemo(() => {
        return (
            user.wishlist.map((item) => ({
                name: item.card.name,
                image: item.card.image_url
            })) ?? []
        )
    }, [user.wishlist, user])

    return (
        <Box bg="white" minH="100vh" color="black">
            <Flex flexDirection="column" gap={6} mt={4}>
                <Flex
                    flexDirection="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    gap={4}
                >
                    <Avatar.Root boxSize="100px" p={2} background="white">
                        <Avatar.Image
                            objectFit="contain"
                            src={
                                profilePictures[user.profile_pic]?.path ??
                                profilePictures[0].path
                            }
                        />
                    </Avatar.Root>
                    <Flex
                        flexDirection="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        gap={2}
                    >
                        {user.firstName || user.lastName ? (
                            <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
                                {user?.firstName} {user?.lastName}
                            </Heading>
                        ) : (
                            <Heading mt={3} fontSize="2xl" fontWeight={'Bold'}>
                                {user?.username}
                            </Heading>
                        )}
                        <Text
                            fontSize="md"
                            color="gray.600"
                            fontWeight={'semibold'}
                        >
                            Wish List - {cards.length} Items
                        </Text>
                    </Flex>
                </Flex>
                <Flex justifyContent="center" alignItems="center" mt={-4}>
                    <Box height="3px" width="97%" bg="black" mt={5} />
                </Flex>
                <SimpleGrid
                    columns={{ base: 3 }}
                    w="100%"
                    gap={{ base: 10, lg: 14 }}
                    px={3}
                >
                    {cards.map((card: PokemonCardImage, index: number) => (
                        <Flex key={index}>
                            <Image
                                src={`${card.image}`}
                                alt={card.name}
                                w="100%"
                                h="auto"
                                borderRadius="none"
                            />
                        </Flex>
                    ))}
                </SimpleGrid>
            </Flex>
        </Box>
    )
}

export default ProfileWishlistLayout
