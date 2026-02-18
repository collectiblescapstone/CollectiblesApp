// credit: https://github.com/nomi30701/yolo-multi-task-onnxruntime-web
import { CV, Mat, Size, Rect, CV_16S } from '@techstark/opencv-js';
import { Tensor } from 'onnxruntime-web';
import { corners } from '@/types/identification';
import { PokemonCard } from '@/types/pokemon-card';

import {
  MODEL_INPUT_WIDTH,
  MODEL_INPUT_HEIGHT,
} from '@/utils/constants';

type postProcessSegmentResult = {
  bbox: { x1: number; y1: number; w: number; h: number };
  classIdx: number;
  score: number;
  maskWeightIdx: number;
};

type MaskData = {
  protoMask: Float32Array;
  maskWeightsData: Float32Array;
  MASK_CHANNELS: number;
  MASK_HEIGHT: number;
  MASK_WIDTH: number;
};

export type PostProcessResult = {
  results: postProcessSegmentResult[];
  masksMat: Mat | null;
};

/**
 * Post-process for End-to-End Segmentation models.
 * Processes bounding boxes and extracts mask weights embedded in the main tensor.
 *
 * @param rawTensor - Main output tensor containing boxes, scores, and mask weights.
 * @param rawMaskTensor - Prototype masks output tensor.
 * @param scoreThreshold - Threshold for confidence score.
 * @returns Tuple of [results, masksData].
 */
const postProcessSegment = (
  rawTensor: Tensor,
  rawMaskTensor: Tensor,
  scoreThreshold: number
): [Array<postProcessSegmentResult>, MaskData] => {
  const NUM_PREDICTIONS = rawTensor.dims[1];
  const NUM_ATTRIBUTES = rawTensor.dims[2];
  // const NUM_BBOX_ATTRS = 6; // x1, y1, x2, y2, score, classidx
  const NUM_MASK_WEIGHTS = 32;

  const predictions = rawTensor.data as Float32Array;

  const protoMask = rawMaskTensor.data as Float32Array;
  const MASK_CHANNELS = rawMaskTensor.dims[1];
  const MASK_HEIGHT = rawMaskTensor.dims[2];
  const MASK_WIDTH = rawMaskTensor.dims[3];

  const results = new Array<postProcessSegmentResult>();
  const maskWeightsData = new Float32Array(NUM_PREDICTIONS * NUM_MASK_WEIGHTS);

  let resultCount = 0;
  for (let i = 0; i < NUM_PREDICTIONS; i++) {
    const offset = i * NUM_ATTRIBUTES;
    const score = predictions[offset + 4];

    if (score <= scoreThreshold) break;

    const classIdx = Math.round(predictions[offset + 5]);
    const x1 = predictions[offset];
    const y1 = predictions[offset + 1];
    const x2 = predictions[offset + 2];
    const y2 = predictions[offset + 3];

    const w = x2 - x1;
    const h = y2 - y1;

    // copy and transpose mask weights
    for (let c = 0; c < NUM_MASK_WEIGHTS; c++) {
      const sourceIdx = offset + 6 + c;
      const destIdx = i + c * NUM_PREDICTIONS;
      maskWeightsData[destIdx] = predictions[sourceIdx];
    }

    results[resultCount++] = {
      bbox: { x1, y1, w, h },
      classIdx,
      score: score,
      maskWeightIdx: i,
    };
  }

  const masksData: MaskData = {
    protoMask,
    maskWeightsData,
    MASK_CHANNELS,
    MASK_HEIGHT,
    MASK_WIDTH,
  };

  return [results, masksData];
};

/**
 * Generate mask overlay image from segmentation results.
 *
 * @param cv - cv instance
 * @param filteredResults - NMS filtered detection results.
 * @param masksData - Object containing mask prototypes and weights.
 * @returns Resulting mask image data, or null if no results.
 */
const postProcessMask = (
  cv: CV,
  filteredResults: postProcessSegmentResult[],
  masksData: MaskData
): Mat | null => {
  if (!filteredResults || filteredResults.length === 0) return null;
  const { protoMask, maskWeightsData, MASK_CHANNELS, MASK_HEIGHT, MASK_WIDTH } =
    masksData;

  // protoMask: [1, 32*160*160] -> cv.Mat(32, 160*160)
  const protoMaskMat = cv.matFromArray(
    MASK_CHANNELS,
    MASK_HEIGHT * MASK_WIDTH,
    cv.CV_32F,
    protoMask
  );

  try {
    // Weights x Proto_mask
    const NUM_FILTERED_RESULTS = filteredResults.length;

    const NUM_PREDICTIONS = maskWeightsData.length / MASK_CHANNELS;
    const maskWeights = new Float32Array(NUM_FILTERED_RESULTS * MASK_CHANNELS);

    for (let i = 0; i < NUM_FILTERED_RESULTS; i++) {
      const baseIdx = filteredResults[i].maskWeightIdx;
      for (let c = 0; c < MASK_CHANNELS; c++) {
        maskWeights[i * MASK_CHANNELS + c] =
          maskWeightsData[baseIdx + c * NUM_PREDICTIONS];
      }
    }

    const maskWeightsMat = cv.matFromArray(
      NUM_FILTERED_RESULTS,
      MASK_CHANNELS,
      cv.CV_32F,
      maskWeights
    );

    const weightsMulProtoMat = new cv.Mat();
    cv.gemm(
      maskWeightsMat, // [N, 32]
      protoMaskMat, // [32, 160*160]
      1.0,
      new cv.Mat(),
      0.0,
      weightsMulProtoMat, // [N, 160*160]
      0
    );

    protoMaskMat.delete();
    maskWeightsMat.delete();

    // Sigmoid
    const maskSigmoidMat = new cv.Mat();
    const onesMat = cv.Mat.ones(weightsMulProtoMat.size(), cv.CV_32F);

    const tempMat2 = new cv.Mat(
      weightsMulProtoMat.rows,
      weightsMulProtoMat.cols,
      cv.CV_32F,
      new cv.Scalar(-1)
    );
    cv.multiply(weightsMulProtoMat, tempMat2, maskSigmoidMat);
    tempMat2.delete();

    cv.exp(maskSigmoidMat, maskSigmoidMat);
    cv.add(maskSigmoidMat, onesMat, maskSigmoidMat);
    cv.divide(onesMat, maskSigmoidMat, maskSigmoidMat);

    onesMat.delete();
    weightsMulProtoMat.delete();

    // Create mask overlay
    const overlayMat = new cv.Mat(
      MODEL_INPUT_WIDTH,
      MODEL_INPUT_HEIGHT,
      cv.CV_8UC4,
      new cv.Scalar(0, 0, 0, 0)
    );

    const maskResizedMat = new cv.Mat();
    const maskBinaryMat = new cv.Mat();
    const maskBinaryU8Mat = new cv.Mat();

    for (let i = 0; i < NUM_FILTERED_RESULTS; i++) {
      const mask = maskSigmoidMat.row(i).data32F;
      const maskMat = cv.matFromArray(MASK_HEIGHT, MASK_WIDTH, cv.CV_32F, mask);

      const x = filteredResults[i].bbox.x1;
      const y = filteredResults[i].bbox.y1;
      const w = filteredResults[i].bbox.w;
      const h = filteredResults[i].bbox.h;

      // 1. Calculate coordinates on the 160x160 mask
      const scaleX = MASK_WIDTH / MODEL_INPUT_WIDTH;
      const scaleY = MASK_HEIGHT / MODEL_INPUT_HEIGHT;

      const maskX = Math.floor(Math.max(0, x * scaleX));
      const maskY = Math.floor(Math.max(0, y * scaleY));
      const maskW = Math.ceil(Math.min(MASK_WIDTH - maskX, w * scaleX));
      const maskH = Math.ceil(Math.min(MASK_HEIGHT - maskY, h * scaleY));

      // Boundary check
      if (maskW > 0 && maskH > 0) {
        // 2. Crop the small region from 160x160 mask
        const maskRoi = maskMat.roi(new cv.Rect(maskX, maskY, maskW, maskH));

        // 3. Resize only this small region to the target bbox size
        const targetX = Math.max(0, Math.floor(x));
        const targetY = Math.max(0, Math.floor(y));
        const targetW = Math.min(MODEL_INPUT_WIDTH - targetX, Math.ceil(w));
        const targetH = Math.min(MODEL_INPUT_HEIGHT - targetY, Math.ceil(h));

        if (targetW > 0 && targetH > 0) {
          cv.resize(
            maskRoi,
            maskResizedMat,
            new cv.Size(targetW, targetH),
            cv.INTER_LINEAR
          );

          // Binarize
          cv.threshold(
            maskResizedMat,
            maskBinaryMat,
            0.5,
            255,
            cv.THRESH_BINARY
          );
          maskBinaryMat.convertTo(maskBinaryU8Mat, cv.CV_8U);

          // Colorize mask
          const colorScalar = new cv.Scalar(255, 255, 255, 255);

          // Create colored mat with target size
          const maskColoredMat = new cv.Mat(
            targetH,
            targetW,
            cv.CV_8UC4,
            colorScalar
          );

          // Copy to overlay mat at the specific bbox location
          maskColoredMat.copyTo(
            overlayMat.roi(new cv.Rect(targetX, targetY, targetW, targetH)),
            maskBinaryU8Mat
          );

          maskColoredMat.delete();
        }
        maskRoi.delete();
      }
      maskMat.delete();
    }
    maskResizedMat.delete();
    maskBinaryMat.delete();
    maskBinaryU8Mat.delete();
    maskSigmoidMat.delete();

    // const dataArray: ImageDataArray = new Uint8ClampedArray(
    //   overlayMat.data.buffer,
    //   overlayMat.data.byteOffset,
    //   overlayMat.data.byteLength
    // ) as ImageDataArray;

    // const imgData = new ImageData(
    //   dataArray,
    //   MODEL_INPUT_WIDTH,
    //   MODEL_INPUT_HEIGHT
    // );
    // overlayMat.delete();

    // return imgData;
    
    return overlayMat;
  } catch (error) {
    console.error('Error masks:', error);
    protoMaskMat.delete();
    return null;
  }
};

/**
 * Post-process ONNX model outputs to generate bounding boxes with mask overlays
 *
 * @param cv cv instance
 * @param detections detections tensor
 * @param proto mask protos tensor
 * @returns
 */
export const processONNXSessionResults = (
  cv: CV,
  detections: Tensor,
  proto: Tensor
): PostProcessResult => {
  const scoreThreshold = 0.5;
  const [results, masksData] = postProcessSegment(detections, proto, scoreThreshold);

  const masksMat = postProcessMask(cv, results, masksData);

  return {
    results: results,
    masksMat: masksMat,
  } as PostProcessResult;
};
