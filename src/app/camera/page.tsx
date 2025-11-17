'use client';

import { Box } from '@chakra-ui/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

const CameraPage = () => {
  const params = useSearchParams();
  const img = params.get('img');

  return (
    <Box position="relative" minW="40dvw" minH="dvh">
      {img ? (
        <Image src={img} alt="Captured" fill />
      ) : (
        <Box>No image captured.</Box>
      )}
    </Box>
  );
};

export default CameraPage;
