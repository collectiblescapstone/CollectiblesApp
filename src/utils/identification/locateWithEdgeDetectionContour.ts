import cvReadyPromise from '@techstark/opencv-js';
import { biggestContour, reorderCorners } from '@/utils/identification/cvutils';
import { CARD_WIDTH_PX, CARD_HEIGHT_PX } from '@/utils/constants';

import { NormalizeCardResult, rotation } from '@/types/identification';

export const locateWithEdgeDetectionContour = async (
  imgCVMat: cvReadyPromise.Mat,
  rot: rotation = rotation.NONE
): Promise<NormalizeCardResult | undefined> => {
  // adapted from NolanAmblard/Pokemon-Card-Scanner/blob/main/main.py

  // get openCV instance
  const cv = await cvReadyPromise;

  // rotate image if needed
  if (rot === rotation.CLOCKWISE) {
    cv.rotate(imgCVMat, imgCVMat, cv.ROTATE_90_CLOCKWISE);
  } else if (rot === rotation.COUNTERCLOCKWISE) {
    cv.rotate(imgCVMat, imgCVMat, cv.ROTATE_90_COUNTERCLOCKWISE);
  } else if (rot === rotation.UPSIDE_DOWN) {
    cv.rotate(imgCVMat, imgCVMat, cv.ROTATE_180);
  }

  // copy imgCVMat to prevent modifying original
  const origImg = new cv.Mat();
  imgCVMat.copyTo(origImg);

  let res: NormalizeCardResult | undefined = undefined;

  // convert color space
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

  // no contours found
  if (contours.size() === 0) {
    // cleanup
    contourFrame.delete();
    bigContour.delete();
    kernel.delete();
    hierarchy.delete();
    contours.delete();
    cvimg.delete();
    return res;
  }

  // find biggest contour
  const { biggest: corners } = biggestContour(cv, contours);

  // draw found contour and warp card
  const warped = cv.Mat.zeros(CARD_HEIGHT_PX, CARD_WIDTH_PX, cv.CV_8UC3);
  if (corners && corners.rows === 4) {
    const reorderedCorners = reorderCorners(corners);

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

    res = {
      image: warped,
      corners: reorderedCorners,
    };

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
  origImg.delete();
  cvimg.delete();

  return res;
};
