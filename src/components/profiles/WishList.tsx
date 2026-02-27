'use client'

import React from 'react'
import Divider from '@/components/profiles/Divider'
import { useRouter } from 'next/navigation'
import { Button, Flex, Image, Text, SimpleGrid } from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { PokemonCardImage } from '@/types/personal-profile'

interface WishListProps {
    type?: 'personal' | 'user'
    username: string
    wishlist: PokemonCardImage[]
}

const WishList: React.FC<WishListProps> = ({ type, username, wishlist }) => {
    const router = useRouter()

    const display = wishlist.slice(0, 3)
    const viewmore = wishlist.length > 3

    const press = () => {
        if (type === 'personal') {
            router.push('/personal-profile/wish')
            return
        }
        router.push(`/user-profile/wish?username=${username}`)
    }

    if (wishlist.length === 0) {
        return (
            <Flex
                flexDirection="column"
                gap={2}
                justifyContent="flex-start"
                alignItems="flex-start"
                w="100%"
                px={4}
            >
                <Divider />
                <Flex mt={1}>
                    <Text
                        fontSize="md"
                        color="gray.900"
                        fontWeight="semibold"
                        mb={2}
                    >
                        Wish List
                    </Text>
                </Flex>
                <Flex
                    w="100%"
                    justifyContent="center"
                    alignItems="center"
                    py={3}
                >
                    <Text
                        fontSize="md"
                        color="gray.600"
                        fontWeight="semibold"
                        mb={2}
                    >
                        User has not added any cards...yet
                    </Text>
                </Flex>
            </Flex>
        )
    }

    return (
        <Flex
            flexDirection="column"
            gap={2}
            justifyContent="flex-start"
            alignItems="flex-start"
            w="100%"
            px={4}
        >
            <Divider />
            <Flex mt={1}>
                <Text
                    fontSize="md"
                    color="gray.900"
                    fontWeight="semibold"
                    mb={2}
                >
                    Wish List
                </Text>
            </Flex>
            <SimpleGrid columns={{ base: 3 }} w="100%" gap={10}>
                {display.map((item, index: number) => (
                    <Flex key={index}>
                        <Image
                            src={`${item.image}`}
                            alt={item.name}
                            w="105px"
                            h="auto"
                            borderRadius="none"
                        />
                    </Flex>
                ))}
            </SimpleGrid>
            <Flex mt={3}>
                {viewmore && (
                    <Button
                        variant="solid"
                        bg="brand.turtoise"
                        color="white"
                        size="sm"
                        onClick={press}
                    >
                        <FiPlus /> View more
                    </Button>
                )}
            </Flex>
        </Flex>
    )
}

export default WishList
