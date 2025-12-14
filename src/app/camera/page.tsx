'use client';

import IdentifyOneCard from '@/components/cv/IdentifyOneCard';
import { Box } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';

const CameraPage = () => {
  const params = useSearchParams();
  const imgUrl = params.get('img');

  return (
    <Box position="relative" minW="40dvw" minH="dvh">
      {imgUrl ? <IdentifyOneCard image={imgUrl} /> : <Box>No image captured.</Box>}
    </Box>
  );
};

export default CameraPage;
