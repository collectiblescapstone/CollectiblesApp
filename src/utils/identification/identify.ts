import { locateWithEdgeDetectionContour } from '@/utils/identification/locateWithEdgeDetectionContour';
import { CardClassifier } from '@/utils/identification/classifyNormalizedCard';
import cvReadyPromise from '@techstark/opencv-js';

import { PredictedImageResult, rotation } from '@/types/identification';

export const IdentifyCardInImage = async (
  src: string,
  rot: rotation = rotation.NONE
): Promise<PredictedImageResult | undefined> => {
  /**
   * DELETE foundCardImage after use to free up memory
   *
   * Identifies the card in the image at the given src URL
   * returns undefined if no card found, otherwise returns ProcessedImageResult
   *
   * @param src - URL of the image to identify the card in
   * @returns ProcessedImageResult | undefined
   */

  const result: PredictedImageResult = {};

  // load image from src URL
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

  // current method to normalize card
  const warped = await locateWithEdgeDetectionContour(origImg, rot);

  if (!warped) {
    return undefined;
  }

  result.foundCardImage = warped.image;
  result.corners = warped.corners;

  // current method to classify card
  const getSimilarCards = await CardClassifier();
  const predictions = getSimilarCards(warped.image);

  result.predictedCard = predictions[0];

  return result;
};
