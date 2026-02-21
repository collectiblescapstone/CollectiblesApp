import { locateWithEdgeDetectionContour } from '@/utils/identification/locateWithEdgeDetectionContour';
import { CardClassifier } from '@/utils/identification/classifyNormalizedCard';
import cvReadyPromise from '@techstark/opencv-js';

import { PredictedImageResult, rotation } from '@/types/identification';
import { locateWithYOLO } from './locateWithYOLO';

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
  
  return result;
};
