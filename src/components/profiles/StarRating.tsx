'use client';

import { Box, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { LuStar } from 'react-icons/lu';

interface StarRatingProps {
  rating: number;
  ratingCount: number;
}

const StarRating = ({ rating, ratingCount }: StarRatingProps) => {
  const colorForRating = useMemo(() => {
    if (rating <= 2.5) {
      return '#ff3b30'; // Red
    } else if (rating < 4.0) {
      return '#ffd60a'; // Yellow
    } else if (rating < 5) {
      return '#32d74b'; // Green
    } else {
      return '#08a9c6'; // Blue
    }
  }, [rating]);

  return (
    <Box display="flex" alignItems="center">
      <LuStar color={ratingCount > 0 ? colorForRating : '#888888'} size={20} />
      <Text
        fontSize="sm"
        fontWeight="semibold"
        color={ratingCount > 0 ? colorForRating : '#888888'}
      >
        {ratingCount > 0 && rating.toFixed(1)}
      </Text>
      <Text fontSize="sm" color="#ababab" fontWeight="semibold" ml={1}>
        ({ratingCount})
      </Text>
    </Box>
  );
};

export default StarRating;
