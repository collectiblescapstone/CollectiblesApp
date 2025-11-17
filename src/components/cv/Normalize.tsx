'use client';

import { useRef, useEffect } from 'react';
import { Box, Grid, Text } from '@chakra-ui/react';
import cvReadyPromise from '@techstark/opencv-js';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '@/utils/constants';
import { biggestContour, drawRectangle, reorderCorners } from '@/utils/cvutils';

interface NormalizeProps {
  image?: string;
}

export default function Normalize({ image }: NormalizeProps) {
  const originalImageRef = useRef<HTMLCanvasElement | null>(null);
  const greyImageRef = useRef<HTMLCanvasElement | null>(null);
  const BlurredImageRef = useRef<HTMLCanvasElement | null>(null);
  const EdgeImageRef = useRef<HTMLCanvasElement | null>(null);
  const ContoursImageRef = useRef<HTMLCanvasElement | null>(null);
  const BiggestContourImageRef = useRef<HTMLCanvasElement | null>(null);
  const ProcessedImageRef = useRef<HTMLCanvasElement | null>(null);

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
    cv.cvtColor(origImg, origImg, cv.COLOR_BGRA2BGR);

    // deep copy so changes to cvimg won't affect origImg
    const cvimg = new cv.Mat();
    origImg.copyTo(cvimg);

    // make greyscale
    cv.cvtColor(cvimg, cvimg, cv.COLOR_BGR2GRAY);

    cv.imshow(greyImageRef.current!, cvimg);

    // blur image
    const ksize = new cv.Size(3, 3);
    cv.GaussianBlur(cvimg, cvimg, ksize, 0);

    cv.imshow(BlurredImageRef.current!, cvimg);

    // edge detection
    cv.Canny(cvimg, cvimg, 75, 100);
    // clean up edges
    const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.dilate(cvimg, cvimg, kernel);
    cv.erode(cvimg, cvimg, kernel);

    cv.imshow(EdgeImageRef.current!, cvimg);

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

    cv.drawContours(contourFrame, contours, -1, new cv.Scalar(0, 255, 0), 5);
    cv.imshow(ContoursImageRef.current!, contourFrame);

    // find biggest contour
    const { biggest: corners } = biggestContour(cv, contours);

    // draw found contour and warp card
    const warped = cv.Mat.zeros(CARD_HEIGHT_PX, CARD_WIDTH_PX, cv.CV_8UC3);
    if (corners && corners.rows === 4) {
      const reorderedCorners = reorderCorners(cv, corners);

      // draw contour
      drawRectangle(cv, bigContour, reorderedCorners);
      cv.imshow(BiggestContourImageRef.current!, bigContour);

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
  }, [image]);

  return (
    <Grid
      templateColumns="repeat(2, 1fr)"
      gap={2}
      minH="inherit"
      minWidth="inherit"
    >
      <Box>
        <Text>Original Image</Text>
        <canvas ref={originalImageRef} style={{ width: '100%' }} />
      </Box>
      <Box>
        <Text>Grey Image</Text>
        <canvas ref={greyImageRef} style={{ width: '100%' }} />
      </Box>
      <Box>
        <Text>Blurred Image</Text>
        <canvas ref={BlurredImageRef} style={{ width: '100%' }} />
      </Box>
      <Box>
        <Text>Edge Image</Text>
        <canvas ref={EdgeImageRef} style={{ width: '100%' }} />
      </Box>
      <Box>
        <Text>Contours Image</Text>
        <canvas ref={ContoursImageRef} style={{ width: '100%' }} />
      </Box>
      <Box>
        <Text>Biggest Contour Image</Text>
        <canvas ref={BiggestContourImageRef} style={{ width: '100%' }} />
      </Box>
      <Box>
        <Text>Processed Image</Text>
        <canvas ref={ProcessedImageRef} style={{ width: '100%' }} />
      </Box>
    </Grid>
  );
}
