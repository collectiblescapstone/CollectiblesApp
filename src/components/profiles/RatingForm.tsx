'use client';

import { UserProfile } from '@/types/personal-profile';
import { baseUrl } from '@/utils/constants';
import { CapacitorHttp } from '@capacitor/core';
import { Box, Button, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LuStar, LuStarHalf } from 'react-icons/lu';

interface RatingFormProps {
  user: UserProfile;
  closeOnSubmit: (id: string, value?: number) => Promise<void>;
}

const RatingForm = ({ user, closeOnSubmit }: RatingFormProps) => {
  const [ratings, setRatings] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleOnClick = (e: React.MouseEvent, index: number) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const fraction = (e.pageX - left) / width > 0.5 ? 1 : 0.5;
    const currentRatings = index + fraction;
    setRatings(currentRatings);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await CapacitorHttp.post({
      url: `${baseUrl}/api/rate-user`,
      data: {
        username: user.username,
        rating: ratings,
      },
    });

    if (res.status === 400) {
      setError('Failed to submit rating: Invalid values');
      setSubmitting(false);
    } else if (res.status === 404) {
      setError('Failed to submit rating: User not found');
      setSubmitting(false);
    } else {
      setSubmitting(false);
      closeOnSubmit('rate-user', ratings);
      router.refresh();
    }
  };

  return (
    <Box display="flex" alignItems="center" flexDirection="column" pb={5}>
      <Box position="relative">
        <Box display="flex" gap={5}>
          {[...Array(5)].map((_, index) => (
            <Box
              key={index}
              onClick={(e) => !submitting && handleOnClick(e, index)}
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
              onClick={(e) => !submitting && handleOnClick(e, index)}
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
      {error && (
        <Text mt={2} fontSize="sm" color="red.500">
          {error}
        </Text>
      )}
      <Button mt={3} onClick={handleSubmit} disabled={submitting}>
        Submit
      </Button>
    </Box>
  );
};

export default RatingForm;
