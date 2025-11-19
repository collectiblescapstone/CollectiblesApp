'use client';

import { useRef, useEffect, useState } from 'react';
import { Box, Button, Flex, Grid, Image, Text } from '@chakra-ui/react';
import Link from 'next/link';
import cvReadyPromise from '@techstark/opencv-js';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '@/utils/constants';
import { biggestContour, drawRectangle, reorderCorners } from '@/utils/cvutils';
import { CardClassifier, CardData } from '@/utils/classification';

interface NormalizeProps {
  image?: string;
}

export default function Normalize({ image }: NormalizeProps) {
  const originalImageRef = useRef<HTMLCanvasElement | null>(null);
  const ProcessedImageRef = useRef<HTMLCanvasElement | null>(null);

  const [predictedCard, setPredictedCard] = useState<CardData>();
  const [getSimilarCards, setGetSimilarCards] =
    useState<(image: cvReadyPromise.Mat, k?: number) => CardData[]>();
  useEffect(() => {
    CardClassifier().then((fn) => setGetSimilarCards(() => fn));
  }, []);
  const [predictedCardImage, setPredictedCardImage] = useState<string>();

  const processImage = async (src: string) => {
    // load image from src URL
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    // wait for image to load and be drawn to canvas
    await new Promise((resolve) => {
      img.onload = () => {
        const canvas = originalImageRef.current!;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(true);
      };
    });

    // adapted from NolanAmblard/Pokemon-Card-Scanner/blob/main/main.py

    // get openCV instance
    const cv = await cvReadyPromise;

    // read image from canvas
    const origImg = cv.imread(originalImageRef.current!);
    cv.cvtColor(origImg, origImg, cv.COLOR_RGBA2RGB);

    // deep copy so changes to cvimg won't affect origImg
    const cvimg = new cv.Mat();
    origImg.copyTo(cvimg);

    // make greyscale
    cv.cvtColor(cvimg, cvimg, cv.COLOR_RGB2GRAY);

    // blur image
    const ksize = new cv.Size(3, 3);
    cv.GaussianBlur(cvimg, cvimg, ksize, 0);

    // edge detection
    cv.Canny(cvimg, cvimg, 75, 100);

    // clean up edges
    const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.dilate(cvimg, cvimg, kernel);
    cv.erode(cvimg, cvimg, kernel);

    // find contours
    const contourFrame = new cv.Mat();
    origImg.copyTo(contourFrame);
    const bigContour = new cv.Mat();
    origImg.copyTo(bigContour);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      cvimg,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // find biggest contour
    const { biggest: corners } = biggestContour(cv, contours);

    // draw found contour and warp card
    const warped = cv.Mat.zeros(CARD_HEIGHT_PX, CARD_WIDTH_PX, cv.CV_8UC3);
    if (corners && corners.rows === 4) {
      const reorderedCorners = reorderCorners(cv, corners);

      // set up matrices for perspective transform
      const pts1 = cv.matFromArray(4, 1, cv.CV_32FC2, [
        reorderedCorners[0][0],
        reorderedCorners[0][1],
        reorderedCorners[1][0],
        reorderedCorners[1][1],
        reorderedCorners[2][0],
        reorderedCorners[2][1],
        reorderedCorners[3][0],
        reorderedCorners[3][1],
      ]);
      const pts2 = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0,
        0,
        CARD_WIDTH_PX,
        0,
        0,
        CARD_HEIGHT_PX,
        CARD_WIDTH_PX,
        CARD_HEIGHT_PX,
      ]);

      // transform card to aligned view
      const Matrix = cv.getPerspectiveTransform(pts1, pts2);
      cv.warpPerspective(
        origImg,
        warped,
        Matrix,
        new cv.Size(CARD_WIDTH_PX, CARD_HEIGHT_PX)
      );
      cv.imshow(ProcessedImageRef.current!, warped);

      // get most similar card
      if (getSimilarCards) {
        const predictions = getSimilarCards(warped);
        setPredictedCard(predictions[0]);
        setPredictedCardImage(predictions[0].card.image + '/low.jpg');
      }

      pts1.delete();
      pts2.delete();
      Matrix.delete();
    }
    contourFrame.delete();
    bigContour.delete();
    if (corners) {
      corners.delete();
    }
    kernel.delete();
    hierarchy.delete();
    contours.delete();
    warped.delete();
    origImg.delete();
    cvimg.delete();
  };

  useEffect(() => {
    if (image) {
      processImage(image);
    }
  }, [image, getSimilarCards]);

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
          <Image src={predictedCardImage} maxHeight="30vh"></Image>
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
}
