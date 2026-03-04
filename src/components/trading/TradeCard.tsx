'use client';

import {
  Avatar,
  Card,
  HStack,
  VStack,
  Stack,
  Text,
} from '@chakra-ui/react';

import TradingCards from '@/components/trading/TradingCards';
import StarRating from '@/components/profiles/StarRating';

type TradeCardProps = {
  username: string;
  avatarUrl?: string;
  rating: number;
};

const TradeCard: React.FC<TradeCardProps> = ({ username, avatarUrl, rating}) =>{
  return (
    // center the card horizontally and constrain its max width
    <Card.Root width="100%" maxW="360px" mx="auto">
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
              {/* reuse shared StarRating component to keep colours/thresholds consistent */}
              <HStack gap="1" align="center">
                <StarRating
                  rating={Number.isFinite(rating) ? rating : 0}
                  ratingCount={Number.isFinite(rating) ? 1 : 0}
                  showCount={false}
                />
              </HStack>
            </Stack>
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
};

export default TradeCard;