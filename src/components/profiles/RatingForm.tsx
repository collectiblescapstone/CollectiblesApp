'use client';

import { Box, Button, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuStar, LuStarHalf } from 'react-icons/lu';

const RatingForm = ({
  closeOnSubmit,
}: {
  closeOnSubmit: (id: string, value?: any) => Promise<void>;
}) => {
  const [ratings, setRatings] = useState(0);

  const handleOnClick = (e: React.MouseEvent, index: number) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const fraction = (e.pageX - left) / width > 0.5 ? 1 : 0.5;
    const currentRatings = index + fraction;
    setRatings(currentRatings);
  };

  return (
    <Box display="flex" alignItems="center" flexDirection="column" pb={5}>
      <Box position="relative">
        <Box display="flex" gap={5}>
          {[...Array(5)].map((_, index) => (
            <Box
              key={index}
              onClick={(e) => handleOnClick(e, index)}
              width="24px"
              height="24px"
              cursor="pointer"
            >
              <LuStar fill="#bbb" color="#bbb" size={35} />
            </Box>
          ))}
        </Box>
        <Box display="flex" gap={5} position="absolute" top={0}>
          {[...Array(Math.ceil(ratings))].map((_, index) => (
            <Box
              key={index}
              onClick={(e) => handleOnClick(e, index)}
              width="24px"
              height="24px"
              cursor="pointer"
            >
              {ratings - index === 0.5 ? (
                <LuStarHalf fill="#f2c75c" color="#f2c75c" size={35} />
              ) : (
                <LuStar fill="#f2c75c" color="#f2c75c" size={35} />
              )}
            </Box>
          ))}
        </Box>
      </Box>
      <Text mt={5} fontSize="lg" color="black" fontWeight="semibold">
        Rating: {ratings.toFixed(1)}
      </Text>
      <Button
        mt={3}
        onClick={() => {
          alert(`You rated this user ${ratings.toFixed(1)} stars!`);
          closeOnSubmit('rate-user', ratings);
        }}
      >
        Submit
      </Button>
    </Box>
  );
};

export default RatingForm;
