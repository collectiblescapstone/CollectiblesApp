'use client';

import { useRef, useEffect, useState } from 'react';
import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { IdentifyCardInImage } from '@/utils/identification/identify';
import {
  PredictedImageResult,
  CardData,
  rotation,
} from '@/types/identification';
import cvReadyPromise, { CV, Mat } from '@techstark/opencv-js';
import { locateWithYOLO } from '@/utils/identification/locateWithYOLO';
import { styleText } from 'util';

interface IdentifyOneCardProps {
  sourceImageData?: ImageData;
  onProcessed: () => void;
}

export const IdentifyOneCard = ({
  sourceImageData,
  onProcessed,
}: IdentifyOneCardProps) => {
  const originalImageRef = useRef<HTMLCanvasElement | null>(null);
  const ProcessedImageRef = useRef<HTMLCanvasElement | null>(null);
  const isProcessing = useRef<boolean>(false);
  const cv = useRef<CV>(null);

  const [predictedCard, setPredictedCard] = useState<CardData>();
  const [predictedCardImage, setPredictedCardImage] = useState<string>();

  const processImage = async (imageData: ImageData, onProcessed: () => void) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    // get openCV instance
    if (!cv.current) {
      const cvInstance = await cvReadyPromise;
      cv.current = cvInstance;
    }

    const annotated = await locateWithYOLO(
      imageData,
      cv.current!,
      false
    );

    if (annotated) {
      originalImageRef.current!.width = annotated.width;
      originalImageRef.current!.height = annotated.height;
      originalImageRef.current!.getContext('2d')!.putImageData(annotated, 0, 0);
    }

    // if (annotated && !annotated.isDeleted()) {
    //   cv.current!.imshow(ProcessedImageRef.current!, annotated);
    // }

    // const result: PredictedImageResult | undefined =
    //   await IdentifyCardInImage(src);

    // if (!result) {
    //   onProcessed();
    //   return;
    // }

    // if (result.foundCardImage) {
    //   // show processed image in canvas
    //   cv.current!.imshow(ProcessedImageRef.current!, result.foundCardImage!);

    //   setPredictedCard(result.predictedCard);
    //   setPredictedCardImage(result.predictedCard?.card.image + '/low.jpg');

    //   result.foundCardImage!.delete();
    // }
    isProcessing.current = false;
    onProcessed();
  };

  useEffect(() => {
    if (sourceImageData) {
      processImage(sourceImageData, onProcessed);
    }
  }, [sourceImageData, onProcessed]);

  return (
    <Box>
      <Box>
        <canvas ref={originalImageRef} style={{backgroundColor:"black"}} />
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
