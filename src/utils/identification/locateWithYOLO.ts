import cvReadyPromise from '@techstark/opencv-js';
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  MODEL_INPUT_WIDTH,
  MODEL_INPUT_HEIGHT,
} from '@/utils/constants';

import { NormalizeCardResult, rotation } from '@/types/identification';

import * as ort from 'onnxruntime-web';
import { biggestContour, reorderCorners } from './cvutils';
import { processONNXSessionResults } from './YOLOONNXUtils';

let session: ort.InferenceSession | null = null;

export const locateWithYOLO = async (
  imgCVMat: cvReadyPromise.Mat,
  rot: rotation = rotation.NONE
// ): Promise<NormalizeCardResult | undefined> => {
): Promise<cvReadyPromise.Mat | undefined> => {
  // get openCV instance
  const cv = await cvReadyPromise;


  let res = undefined;
  
  // resize image to model input size
  const dsize = new cv.Size(MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT);
  const resizedMat = new cv.Mat();
  cv.resize(imgCVMat, resizedMat, dsize, 0, 0, cv.INTER_CUBIC);
  

  // rotate image if needed
  if (rot === rotation.CLOCKWISE) {
    cv.rotate(resizedMat, resizedMat, cv.ROTATE_90_CLOCKWISE);
  } else if (rot === rotation.COUNTERCLOCKWISE) {
    cv.rotate(resizedMat, resizedMat, cv.ROTATE_90_COUNTERCLOCKWISE);
  } else if (rot === rotation.UPSIDE_DOWN) {
    cv.rotate(resizedMat, resizedMat, cv.ROTATE_180);
  }

  cv.cvtColor(resizedMat, resizedMat, cv.COLOR_RGBA2RGB);

  // split
  const channels = new cv.MatVector();
  cv.split(resizedMat, channels);

  // stack
  const chwMats = new cv.Mat();
  cv.vconcat(channels, chwMats);

  // normalize
  chwMats.convertTo(chwMats, cv.CV_32F, 1 / 255.0);

  const inputTensor = new ort.Tensor('float32', chwMats.data32F, [
    1,
    3,
    MODEL_INPUT_HEIGHT,
    MODEL_INPUT_WIDTH,
  ]);
  
  // load YOLO model
  if (!session) {
    session = await ort.InferenceSession.create('/models/card_yolo.onnx');
  }

  // run inference
  const feeds: Record<string, ort.Tensor> = {};
  feeds[session.inputNames[0]] = inputTensor;
  const results = await session.run(feeds);
  const detections = results[session.outputNames[0]]; // 1, 300, 38
  const proto = results[session.outputNames[1]]; // 1, 32, 160, 160

  const resultsProcessed = processONNXSessionResults(detections, proto, imgCVMat, cv);

  return resultsProcessed;

  //   return undefined

  //   const contours = new cv.MatVector();
  //   const hierarchy = new cv.Mat();
  //   cv.findContours(
  //     cardContour,
  //     contours,
  //     hierarchy,
  //     cv.RETR_EXTERNAL,
  //     cv.CHAIN_APPROX_SIMPLE
  //   );

  //   // find biggest contour
  //   const { biggest: corners } = biggestContour(cv, contours);

  //   // draw found contour and warp card
  //   const warped = cv.Mat.zeros(CARD_HEIGHT_PX, CARD_WIDTH_PX, cv.CV_8UC3);
  //   if (corners && corners.rows === 4) {
  //     const reorderedCorners = reorderCorners(corners);

  //     // set up matrices for perspective transform
  //     const pts1 = cv.matFromArray(4, 1, cv.CV_32FC2, [
  //       reorderedCorners[0][0],
  //       reorderedCorners[0][1],
  //       reorderedCorners[1][0],
  //       reorderedCorners[1][1],
  //       reorderedCorners[2][0],
  //       reorderedCorners[2][1],
  //       reorderedCorners[3][0],
  //       reorderedCorners[3][1],
  //     ]);
  //     const pts2 = cv.matFromArray(4, 1, cv.CV_32FC2, [
  //       0,
  //       0,
  //       CARD_WIDTH_PX,
  //       0,
  //       0,
  //       CARD_HEIGHT_PX,
  //       CARD_WIDTH_PX,
  //       CARD_HEIGHT_PX,
  //     ]);

  //     // transform card to aligned view
  //     const Matrix = cv.getPerspectiveTransform(pts1, pts2);
  //     cv.warpPerspective(
  //       origImg,
  //       warped,
  //       Matrix,
  //       new cv.Size(CARD_WIDTH_PX, CARD_HEIGHT_PX)
  //     );

  //     res = {
  //       image: warped,
  //       corners: reorderedCorners,
  //     };

  //     // cleanup
  //     pts1.delete();
  //     pts2.delete();
  //     Matrix.delete();
  //     corners.delete();
  //   }
  //   // cleanup
  //   cardContour.delete();
  //   contours.delete();
  //   hierarchy.delete();
  // }
  // // cleanup
  // resizedMat.delete();
  // imgCVMat.delete();

  // return res;
};
