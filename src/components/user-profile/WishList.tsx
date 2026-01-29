'use client';

import React from 'react';
import Divider from '@/components/user-profile/Divider';
import { useRouter } from 'next/navigation';
import { Button, Flex, Image, Text, SimpleGrid } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { PokemonCardImage } from '@/types/personal-profile';

interface WishListProps {
  username: string;
  wishlist: PokemonCardImage[];
}

const WishList: React.FC<WishListProps> = ({ username, wishlist }) => {
  const router = useRouter();

  const display = wishlist.slice(0, 3);
  const viewmore = wishlist.length > 3;

  const press = () => {
    router.push(`/user-profile/wish?username=${username}`);
  };

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
        <Text fontSize="md" color="gray.900" fontWeight="semibold" mb={2}>
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
            bg="brand.turtiose"
            color="white"
            size="sm"
            onClick={press}
          >
            <FiPlus /> View more
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default WishList;
