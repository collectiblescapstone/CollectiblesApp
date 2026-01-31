'use client';

import { useRef, useEffect, useState } from 'react';
import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { IdentifyCardInImage } from '@/utils/identification/identify';
import { PredictedImageResult, CardData, rotation } from '@/types/identification';
import cvReadyPromise from '@techstark/opencv-js';
import { locateWithYOLO } from '@/utils/identification/locateWithYOLO';

interface IdentifyOneCardProps {
  image?: string;
  onProcessed: () => void;
}

export const IdentifyOneCard = ({ image, onProcessed }: IdentifyOneCardProps) => {
  const originalImageRef = useRef<HTMLCanvasElement | null>(null);
  const ProcessedImageRef = useRef<HTMLCanvasElement | null>(null);

  const [predictedCard, setPredictedCard] = useState<CardData>();
  const [predictedCardImage, setPredictedCardImage] = useState<string>();

  const processImage = async (src: string, onProcessed: () => void) => {

    const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
    
      // wait for image to load and be drawn to canvas
      await new Promise((resolve) => {
        img.onload = () => {
          resolve(true);
        };
      });
    
      // get openCV instance
      const cv = await cvReadyPromise;
    
      // read image
      const origImg = cv.imread(img);

      const annotated = await locateWithYOLO(origImg, rotation.NONE);

      if (annotated) {
        cv.imshow(ProcessedImageRef.current!, annotated);
      }

    // const result: PredictedImageResult | undefined =
    //   await IdentifyCardInImage(src);

    // if (!result) {
    //   onProcessed();
    //   return;
    // }

    // if (result.foundCardImage) {
    //   // show processed image in canvas
    //   const cv = await cvReadyPromise;
    //   cv.imshow(ProcessedImageRef.current!, result.foundCardImage!);

    //   setPredictedCard(result.predictedCard);
    //   setPredictedCardImage(result.predictedCard?.card.image + '/low.jpg');

    //   result.foundCardImage!.delete();
    // }
    onProcessed();
  };

  useEffect(() => {
    if (image) {
      processImage(image,onProcessed);
    }
  }, [image, onProcessed]);

  

  return (
    <Box>
      <Box style={{ display: 'none' }}>
        <canvas ref={originalImageRef} />
      </Box>
      <Flex flexDirection="column">
        <Box maxHeight="40vh" justifyItems="center">
          <Text>Found Card</Text>
          <canvas ref={ProcessedImageRef} style={{ height: '30vh' }} />
        </Box>
        <Box maxHeight="40vh" justifyItems="center">
          <Text>Identified Card</Text>
          <Image
            src={predictedCardImage}
            maxHeight="30vh"
            alt="identified card"
          ></Image>
        </Box>
      </Flex>
      <Flex
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        mt={1}
        gap={1}
      >
        <Text>
          {predictedCard?.card.name} ({predictedCard?.card.id.split('-')[1]})
        </Text>
        <Text>
          From: {predictedCard?.card.set.name} ({predictedCard?.card.set.id})
        </Text>
        <Link
          href={{
            pathname: '/editCard',
            query: {
              imageUrl: predictedCard?.card.image ?? '',
              cardName: `${predictedCard?.card.name ?? ''} (${predictedCard?.card.id.split('-')[1]})`,
              cardSet: predictedCard?.card.set.name ?? '',
            },
          }}
        >
          <Button maxW="40vw">Add To Collection</Button>
        </Link>
      </Flex>
    </Box>
  );
};
