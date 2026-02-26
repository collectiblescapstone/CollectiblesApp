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
    if (rating <= 1.5) {
      return '#580202';
    } else if (rating <= 2.5) {
      return '#EF4444';
    } else if (rating <= 3.5) {
      return '#FB923C';
    } else if (rating <= 4.5) {
      return '#F9CF38';
    } else {
      return '#32D74B';
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
