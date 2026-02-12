'use client';

import { IdentifyOneCard } from '@/components/cv/IdentifyOneCard';
import { useAuth } from '@/context/AuthProvider';
import { Box, Spinner } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';

const CameraPage = () => {
  const params = useSearchParams();
  const imgUrl = params.get('img');
  const { session, loading } = useAuth();

  if (loading || !session) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box position="relative" minW="40dvw" minH="dvh">
      {imgUrl ? (
        <IdentifyOneCard image={imgUrl} />
      ) : (
        <Box>No image captured.</Box>
      )}
    </Box>
  );
};

export default CameraPage;
