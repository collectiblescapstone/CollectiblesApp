'use client';

import Normalize from '@/components/cv/Normalize';
import { Box } from '@chakra-ui/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

const CameraPage = () => {
  const params = useSearchParams();
  const imgUrl = params.get('img');

  return (
    <Box position="relative" minW="40dvw" minH="dvh">
      {imgUrl ? <Normalize image={imgUrl} /> : <Box>No image captured.</Box>}
    </Box>
  );
};

export default CameraPage;
