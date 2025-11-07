'use client';

import React from 'react';

import {
  Box,
  Flex,
  Image
} from '@chakra-ui/react';

import { FiPlusCircle, FiXCircle } from 'react-icons/fi';

type CardType = {
  imageSrc: string;
};

const cards: CardType[] = [
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'},
  {imageSrc: '/user-profile/card_temp.png'},
];

const WishScreen: React.FC = () => {
  return (
    <Box bg="white" minH="100vh" color="black">
        <Flex
            flexDirection="column"
            gap={6}
            mt={16}
        >
            <Flex
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            wrap="wrap"
            gap={7}
            >
                <Box 
                    position="relative" 
                    w="105px"
                    h="140px" 
                    overflow="hidden"
                    rounded="md"
                >
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        w="100%"
                        h="100%"
                        bg="black"
                        opacity={0.5}
                    />
                    <Flex
                        position="absolute"
                        justifyContent="center"
                        alignItems="center"
                        top={0}
                        left={0}
                        w="100%"
                        h="100%"
                    >
                        <FiPlusCircle size={26} color='white'/>
                    </Flex>
                </Box>
            {cards.map((card, index) => (
                <Flex
                key={index}
                >
                <Box 
                    position="relative" 
                    w="105px"
                    h="auto" 
                    overflow="hidden"
                >
                    <Image
                        src={card.imageSrc}
                        alt="Showcase Card"
                        w="105px"
                        h="auto"
                        borderRadius="none"
                    />  
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        w="100%"
                        h="100%"
                        bg="black"
                        opacity={0.5}
                    />
                    <Flex
                        position="absolute"
                        justifyContent="center"
                        alignItems="center"
                        top={0}
                        left={0}
                        w="100%"
                        h="100%"
                    >
                        <FiXCircle size={26} color='white'/>
                    </Flex>
                </Box>
                </Flex>
            ))}
            </Flex>
        </Flex>
    </Box>
  );
};
    
export default WishScreen;