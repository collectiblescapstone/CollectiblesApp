import { CV, Mat } from '@techstark/opencv-js';
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  MODEL_INPUT_WIDTH,
  MODEL_INPUT_HEIGHT,
} from '@/utils/constants';

import { NormalizeCardResult, rotation } from '@/types/identification';

import { InferenceSession, Tensor } from 'onnxruntime-web';
import { biggestContour, filterContours, reorderCorners } from './cvutils';
import { processONNXSessionResults, PostProcessResult } from './YOLOONNXUtils';
import { loadModel } from './loadModel';

let session: InferenceSession | null = null;
let errorCount = 0;

/**
 * uses a custom yolo segmentation model to locate and identify cards from imagedata (MUST BE SQUARE ASPECT RATIO)
 * 
 * @param imageData Square aspect ratio image data to process
 * @param cv cv instance
 * @param logging should logging be enabled
 * @returns 
 */
export const locateWithYOLO = async (
  imageData: ImageData,
  cv: CV,
  logging: boolean = false
  // ): Promise<NormalizeCardResult | undefined> => {
): Promise<ImageData | null> => {
  if (errorCount >= 5) {
    console.warn('Too many errors in locateWithYOLO, skipping processing.');
    return null;
  }
  let res = null;

  const matsToDelete: Mat[] = [];
  let inputTensor: Tensor | null = null;
  let detections: Tensor | null = null;
  let proto: Tensor | null = null;

  try {
    if (logging) console.log('creating srcMat');
    // ----------
    const srcMat = new cv.Mat(imageData.height, imageData.width, cv.CV_8UC4);
    srcMat.data.set(imageData.data);
    matsToDelete.push(srcMat);


    if (logging) console.log('resizing image');
    // ---------
    const resizedMat = new cv.Mat();
    cv.resize(srcMat, resizedMat, new cv.Size(MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT));
    matsToDelete.push(resizedMat);

    cv.cvtColor(resizedMat, resizedMat, cv.COLOR_RGBA2RGB);
    
    if (logging) console.log('creating blob from image');
    // ----------
    const preProcessed = cv.blobFromImage(
      resizedMat,
      1 / 255.0,
      { width: MODEL_INPUT_WIDTH, height: MODEL_INPUT_HEIGHT },
      [0, 0, 0, 0],
      false,
      false
    );

    if (logging) console.log('creating input tensor');
    // ----------
    const tensorShape = [1, 3, MODEL_INPUT_HEIGHT, MODEL_INPUT_WIDTH]; // [batch, channel, height, width]
    inputTensor = new Tensor('float32', preProcessed.data32F, tensorShape);
    preProcessed.delete();
    
    if (logging) console.log('loading YOLO ONNX model');
    // ----------
    const session = await loadModel('/models/card_yolo.onnx');
    
    if (logging) console.log('running YOLO ONNX model inference');
    // ----------
    const output = await session.run({ images: inputTensor });
    detections = output[session.outputNames[0]]; // 1, 300, 38
    proto = output[session.outputNames[1]]; // 1, 32, 160, 160
    
    if (logging) console.log('post-processing');
    // ----------
    const resultsProcessed = processONNXSessionResults(
      cv,
      detections,
      proto
    );

    if (!resultsProcessed || !resultsProcessed.masksMat || resultsProcessed.results.length === 0) {
      return null;
    }

    if (logging) console.log('finding contours');
    // ----------
    const masksMat = resultsProcessed.masksMat;
    matsToDelete.push(masksMat);

    // convert to single channel
    const singleChannelMat = new cv.Mat();
    cv.cvtColor(masksMat, singleChannelMat, cv.COLOR_RGBA2GRAY);
    matsToDelete.push(singleChannelMat);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    matsToDelete.push(hierarchy);
    cv.findContours(
      singleChannelMat,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    for (let i = 0; i < contours.size(); i++) {
      matsToDelete.push(contours.get(i));
    }

    if (logging) console.log('filtering contours');
    // ----------
    // find contours with 4 sides, a big enough area, and not touching edge of image
    const filteredContours = filterContours(cv, contours);

    
    if (logging) console.log('extracting cards from srcMat');
    // ----------
    
    // calculate scale factor between model input size and original image
    const scaleFactorX = imageData.width / MODEL_INPUT_WIDTH;
    const scaleFactorY = imageData.height / MODEL_INPUT_HEIGHT;

    const cardMats: Mat[] = [];

    for (const contour of filteredContours) {
      // draw found contour and warp card
      const warped = cv.Mat.zeros(CARD_HEIGHT_PX, CARD_WIDTH_PX, cv.CV_8UC3);
      const reorderedCorners = reorderCorners(contour);

      // set up matrices for perspective transform
      const pts1 = cv.matFromArray(4, 1, cv.CV_32FC2, [
        reorderedCorners[0][0] * scaleFactorX,
        reorderedCorners[0][1] * scaleFactorY,
        reorderedCorners[1][0] * scaleFactorX,
        reorderedCorners[1][1] * scaleFactorY,
        reorderedCorners[2][0] * scaleFactorX,
        reorderedCorners[2][1] * scaleFactorY,
        reorderedCorners[3][0] * scaleFactorX,
        reorderedCorners[3][1] * scaleFactorY,
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
        srcMat,
        warped,
        Matrix,
        new cv.Size(CARD_WIDTH_PX, CARD_HEIGHT_PX)
      );
      cardMats.push(warped);
    }

    // delete me
    if (cardMats.length > 0) {
      // get image data
      const cardImageData = new ImageData(CARD_WIDTH_PX, CARD_HEIGHT_PX);
      cv.cvtColor(cardMats[0], cardMats[0], cv.COLOR_RGB2RGBA);
      cardImageData.data.set(cardMats[0].data);
      res = cardImageData;
    }

    // process cards


  } catch (e) {
    console.error('Error in locateWithYOLO:', e);
    errorCount++;
  } finally {
    // garbage collection
    matsToDelete.forEach((mat) => {
      if (mat && !mat.isDeleted()) {
        mat.delete();
      }
    });
    if (inputTensor) inputTensor.dispose();
    if (detections) detections.dispose();
    if (proto) proto.dispose();
  }
  
  return res;
};
