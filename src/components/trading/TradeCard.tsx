'use client';

import {
  Avatar,
  Card,
  HStack,
  VStack,
  Stack,
  Text,
  Box,
} from '@chakra-ui/react';

import TradingCards from '@/components/trading/TradingCards';
import {
  LuStar,
} from 'react-icons/lu';

type TradeCardProps = {
  username: string;
  avatarUrl?: string;
  rating: number;
};

const TradeCard: React.FC<TradeCardProps> = ({ username, avatarUrl, rating}) =>{
  return (
    <Card.Root width="80%">
      <Card.Body>
        {/*their cards*/}
        <VStack align="center" gap={2}>
          <TradingCards />
          <VStack align="center" gap="0">
            <HStack mb="0" gap="3">
              <Avatar.Root>
                <Avatar.Image src={avatarUrl ?? "https://images.unsplash.com/photo-1511806754518-53bada35f930"} />
                <Avatar.Fallback name={username} />
              </Avatar.Root>
              <Stack gap="0">
                <Text fontWeight="semibold" textStyle="sm">
                  {username}
                </Text>
              </Stack>
            </HStack>
            <Stack gap="0">
              {/* show star and numeric rating side-by-side */}
              <HStack gap="1" align="center">
                <Box>
                  {(() => {
                    const color =
                      rating <= 2.5
                        ? '#ff3b30'
                        : rating < 4.0
                          ? '#ffd60a'
                          : rating < 5
                            ? '#32d74b'
                            : '#08a9c6';
                    return <LuStar color={color} size={20} />;
                  })()}
                </Box>
                <Text fontSize="sm" fontWeight="semibold">{Number.isFinite(rating) ? rating.toFixed(1) : '-'}</Text>
              </HStack>
            </Stack>
          </VStack>
        </VStack>


        {/*/!*TODO: GET RID OF THIS, JUST SHOW THEIR CARDS, HAVE A POPUP WHEN YOU PRESS ON THE CARD*/}
        {/*SHOWING WHAT THE TRADE IS, WHEN CLICK ON THEIR PFP OR USER LEAD TO THEIR PROFILE*!/*/}
        {/*<LuArrowRightLeft size={150} />*/}

        {/*/!*your cards*!/*/}
        {/*<VStack align="center" gap={2}>*/}
        {/*  <TradingCards />*/}
        {/*  <Text fontSize="sm" fontWeight="semibold">Your cards</Text>*/}
        {/*</VStack>*/}

      </Card.Body>
    </Card.Root>
  )
};

export default TradeCard;