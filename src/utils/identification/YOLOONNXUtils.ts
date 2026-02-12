// typescript translation of code from https://github.com/ataffe/YoloOnnxRuntimeCPP/blob/main/c%2B%2B/video_test.cpp

import cvReadyPromise, {
  CV,
  Mat,
  Size,
  Rect,
  CV_16S,
} from '@techstark/opencv-js';
import * as ort from 'onnxruntime-web';
import { corners } from '@/types/identification';
import { PokemonCard } from '@/types/pokemon-card';

import {
  MODEL_INPUT_WIDTH,
  MODEL_INPUT_HEIGHT,
  YOLO_NUM_CLASSES,
} from '@/utils/constants';
import { da } from 'zod/v4/locales';

export interface processedResult {
  predictedCard: PokemonCard;
  corners: corners;
  confidence: number;
}

interface YoloBoundingBox {
  bounding_box: { x: number; y: number; width: number; height: number };
  confidence: number;
  class_id: number;
  mask_coefficients: number[];
  mask: Mat;
}

export const getYoloBoxes = (detections: ort.Tensor, cv: CV): Mat => {
  const outputShape = detections.dims;

  // Convert detections to OpenCV Mat
  const raw_boxes = cv
    .matFromArray(
      outputShape[1],
      outputShape[2],
      cv.CV_32F,
      detections.data as Float32Array
    )
    .t();

  return raw_boxes;
};

const clipBox = (
  box: { x: number; y: number; width: number; height: number },
  originalShape: Size
) => {
  box.x = Math.max(0, Math.min(box.x, originalShape.width));
  box.y = Math.max(0, Math.min(box.y, originalShape.height));
  box.width = Math.max(0, Math.min(box.width, originalShape.width - box.x));
  box.height = Math.max(0, Math.min(box.height, originalShape.height - box.y));
};

const scaleYoloBoundingBox = (
  box: YoloBoundingBox,
  originalFrameSize: Size,
  cv: CV
): YoloBoundingBox => {
  const scale_ratio = Math.min(
    MODEL_INPUT_WIDTH / originalFrameSize.width,
    MODEL_INPUT_HEIGHT / originalFrameSize.height
  );
  const letterbox_pad_horizontal =
    (MODEL_INPUT_WIDTH - originalFrameSize.width * scale_ratio) / 2;
  const letterbox_pad_vertical =
    (MODEL_INPUT_HEIGHT - originalFrameSize.height * scale_ratio) / 2;
  box.bounding_box.x =
    (box.bounding_box.x - letterbox_pad_horizontal) / scale_ratio;
  box.bounding_box.y =
    (box.bounding_box.y - letterbox_pad_vertical) / scale_ratio;
  box.bounding_box.width /= scale_ratio;
  box.bounding_box.height /= scale_ratio;

  clipBox(box.bounding_box, originalFrameSize);

  return box;
};

export const processYoloBoundingBoxes = (
  raw_boxes: Mat,
  originalFrameSize: Size,
  cv: CV
): YoloBoundingBox[] => {
  const num_mask_coefficients = 32;
  const data_width = YOLO_NUM_CLASSES + num_mask_coefficients + 4; // 4 is for x, y, width, height UNSURE
  const bounding_box_data = raw_boxes.data32F;

  const processedBoxes: YoloBoundingBox[] = [];

  for (let i = 0; i < raw_boxes.rows; i++) {
    // Step 1: Parse x, y, Width, Height, max class score
    // Save all class scores starting at index 4
    const class_scores = bounding_box_data.slice(
      i * data_width + 4,
      i * data_width + 4 + YOLO_NUM_CLASSES
    );

    // find max score
    let max_class_id = 0;
    let confidence = class_scores[0];
    for (let c = 1; c < YOLO_NUM_CLASSES; c++) {
      if (class_scores[c] > confidence) {
        confidence = class_scores[c];
        max_class_id = c;
      }
    }

    // Step 2: If max score > threshold, create bounding box
    const confidence_threshold = 0.25;
    if (confidence > confidence_threshold) {
      const x = Math.max(0, bounding_box_data[i * data_width + 0]);
      const y = Math.max(0, bounding_box_data[i * data_width + 1]);
      const width = bounding_box_data[i * data_width + 2];
      const height = bounding_box_data[i * data_width + 3];
      const mask_coefficients = Array.from(
        bounding_box_data.slice(
          i * data_width + 4 + YOLO_NUM_CLASSES,
          i * data_width + data_width
        )
      );

      const box: YoloBoundingBox = {
        bounding_box: { x, y, width, height },
        confidence,
        class_id: max_class_id,
        mask_coefficients,
        mask: new cv.Mat(),
      };
      processedBoxes.push(box);
    }
  }

  // Step 3: Non-Max Suppression
  const boxNum = processedBoxes.length;

  const nmsThreshold = 0.7;
  const finalBoxes: YoloBoundingBox[] = [];

  // NMS from https://github.com/opencv/opencv/blob/4.x/doc/js_tutorials/js_assets/js_object_detection.html#L157
  let temp_boxes: [YoloBoundingBox, number][] = [];
  for (let c = 0; c < YOLO_NUM_CLASSES; c++) {
    for (let i = 0; i < processedBoxes.length; i++) {
      temp_boxes[i] = [processedBoxes[i], i];
    }
    const sorted_boxes = temp_boxes.sort(
      (a, b) => b[0].confidence - a[0].confidence
    );

    for (let i = 0; i < boxNum; i++) {
      if (sorted_boxes[i][0].confidence === 0) {
        continue;
      } else {
        for (let j = i + 1; j < boxNum; j++) {
          // compute IoU
          const box1 = sorted_boxes[i][0].bounding_box;
          const box2 = sorted_boxes[j][0].bounding_box;
          const x1 = Math.max(box1.x, box2.x);
          const y1 = Math.max(box1.y, box2.y);
          const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
          const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
          const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
          const union =
            box1.width * box1.height + box2.width * box2.height - intersection;
          const iou = intersection / union;
          // suppress box if IoU > threshold
          if (iou > nmsThreshold) {
            processedBoxes[sorted_boxes[j][1]].confidence = 0;
          }
        }
      }
    }
  }

  for (let i = 0; i < boxNum; i++) {
    if (processedBoxes[i].confidence > 0) {
      finalBoxes.push(processedBoxes[i]);
    }
  }

  // Step 4: Scale bounding Boxes
  finalBoxes.map((box) => scaleYoloBoundingBox(box, originalFrameSize, cv));

  // cleanup
  processedBoxes.forEach((box) => {
    box.mask_coefficients = [];
    box.mask.delete();
  });

  return finalBoxes;
};

const resizeMaskRemoveLetterbox = (
  input_mask: Mat,
  orig_image_bounding_box: YoloBoundingBox['bounding_box'],
  letterbox_shape: Size,
  cv: CV
): Mat | undefined => {
  // calculate scale ratio
  const scale_ratio = Math.min(
    letterbox_shape.width / orig_image_bounding_box.width,
    letterbox_shape.height / orig_image_bounding_box.height
  );

  // calculate unpadded letterbox image width / height
  const unpadded_width = Math.round(
    orig_image_bounding_box.width * scale_ratio
  );
  const unpadded_height = Math.round(
    orig_image_bounding_box.height * scale_ratio
  );

  // calculate horizontal / vertical padding
  const pad_w = letterbox_shape.width - unpadded_width;
  const pad_h = letterbox_shape.height - unpadded_height;

  // calculate left and top
  const pad_left = Math.round(pad_w / 2.0);
  const pad_top = Math.round(pad_h / 2.0);

  // Step 2: Resize mask to letterbox shape (from 160x160 to 640x640)
  const resized_mask = new cv.Mat();
  cv.resize(
    input_mask,
    resized_mask,
    new cv.Size(letterbox_shape.width, letterbox_shape.height),
    0,
    0,
    cv.INTER_LINEAR
  );

  // Step 3: Crop out the padding area
  const roi = new cv.Rect(pad_left, pad_top, unpadded_width, unpadded_height);

  // prevent invalid ROI
  if (
    roi.x < 0 ||
    roi.y < 0 ||
    roi.width <= 0 ||
    roi.height <= 0 ||
    roi.x + roi.width > resized_mask.cols ||
    roi.y + roi.height > resized_mask.rows
  ) {
    // invalid ROI, return empty mask
    resized_mask.delete();
    return undefined;
  }

  const cropped_view = resized_mask.roi(roi);
  const cropped_mask = cropped_view.clone();
  cropped_view.delete();

  // Step 4: Resize to desired final output size (orig_image_bounding_box)
  const rounded_width = Math.max(Math.round(orig_image_bounding_box.width), 1);
  const rounded_height = Math.max(
    Math.round(orig_image_bounding_box.height),
    1
  );
  const final_mask = new cv.Mat(
    rounded_height,
    rounded_width,
    input_mask.type()
  );
  cv.resize(
    cropped_mask,
    final_mask,
    new cv.Size(rounded_width, rounded_height),
    0,
    0,
    cv.INTER_LINEAR
  );

  // cleanup
  resized_mask.delete();
  cropped_mask.delete();
  return final_mask;
};

const processYOLOMasks = (
  boxes: YoloBoundingBox[],
  prototypeMasksData: Float32Array,
  dimensions: number[],
  originalFrameSize: Size,
  cv: CV,
  logging: boolean = false
): YoloBoundingBox[] => {
  // prototypeMasks: [1, 32, 160, 160]
  const proto_mask_width = dimensions[2];
  const proto_mask_height = dimensions[3];

  // reshape prototypeMasks to 2d cv.Mat [32, 160*160]
  const proto_masks = cv.matFromArray(
    dimensions[1],
    proto_mask_width * proto_mask_height,
    cv.CV_32F,
    prototypeMasksData
  );

  if (logging) console.log('initialized proto_masks');

  // for each box, generate mask
  for (let i = 0; i < boxes.length; i++) {
    if (logging)
      console.log('processing box ' + (i + 1) + ' of ' + boxes.length);
    const box = boxes[i];
    if (box.bounding_box.width <= 0 || box.bounding_box.height <= 0) {
      boxes[i].confidence = 0;
      continue;
    }

    if (logging) console.log('matFrmArray');
    const coeffMat = cv.matFromArray(1, 32, cv.CV_32F, box.mask_coefficients);
    // const coeffMatT = coeffMat.t(); // transpose to [32, 1]

    let combinedMasks = new cv.Mat(
      proto_mask_width,
      proto_mask_height,
      cv.CV_32F
    );
    // check dimensions
    if (logging) console.log('gemm');
    if (coeffMat.cols !== proto_masks.rows) {
      if (logging) {
        console.error('Dimension mismatch for matrix multiplication');
      }
      coeffMat.delete();
      combinedMasks.delete();
      continue;
    }
    const tempRow = new cv.Mat(
      1,
      proto_mask_width * proto_mask_height,
      cv.CV_32F
    );
    // matrix multiplication
    const empty = new cv.Mat();
    cv.gemm(coeffMat, proto_masks, 1, empty, 0, tempRow);
    empty.delete();

    combinedMasks.data32F.set(tempRow.data32F);
    tempRow.delete();

    // apply sigmoid
    if (logging) console.log('sigmoid');
    const onesMat = cv.Mat.ones(
      combinedMasks.rows,
      combinedMasks.cols,
      cv.CV_32F
    );
    cv.exp(combinedMasks, combinedMasks);
    cv.add(combinedMasks, onesMat, combinedMasks);
    cv.divide(onesMat, combinedMasks, combinedMasks);

    if (logging) console.log('resizeMaskRemoveLetterbox');
    const scaled_mask = resizeMaskRemoveLetterbox(
      combinedMasks,
      box.bounding_box,
      originalFrameSize,
      cv
    );
    if (!scaled_mask) {
      boxes[i].confidence = 0;
      coeffMat.delete();
      combinedMasks.delete();
      onesMat.delete();
      continue;
    }

    if (logging) console.log('roi');
    let x = box.bounding_box.x;
    let y = box.bounding_box.y;
    let width = box.bounding_box.width;
    let height = box.bounding_box.height;

    x = Math.max(0, Math.min(x, scaled_mask.cols - 1));
    y = Math.max(0, Math.min(y, scaled_mask.rows - 1));
    width = Math.max(0, Math.min(width, scaled_mask.cols - x));
    height = Math.max(0, Math.min(height, scaled_mask.rows - y));

    if (width <= 0 || height <= 0) {
      boxes[i].confidence = 0;
      coeffMat.delete();
      combinedMasks.delete();
      scaled_mask.delete();
      onesMat.delete();
      continue;
    }

    const bounding_rect = new cv.Rect(
      Math.round(x),
      Math.round(y),
      Math.round(width),
      Math.round(height)
    );
    const cropped_view = scaled_mask.roi(bounding_rect);
    const cropped_mask = cropped_view.clone();
    cropped_view.delete();

    if (logging) console.log('convert');
    cropped_mask.convertTo(cropped_mask, cv.CV_8UC1, 255.0);

    boxes[i].mask = cropped_mask;

    // cleanup
    coeffMat.delete();
    combinedMasks.delete();
    scaled_mask.delete();
    onesMat.delete();
  }

  proto_masks.delete();

  return boxes;
};

export const drawOnFrame = (
  boxes: YoloBoundingBox[],
  frame: Mat,
  cv: CV
): Mat => {
  const maskedImg = frame.clone();
  boxes.forEach((box) => {
    const { x, y, width, height } = box.bounding_box;

    // Draw bounding box
    const point1 = new cv.Point(x, y);
    const point2 = new cv.Point(
      x + width,
      y + height
    );
    cv.rectangle(maskedImg, point1, point2, new cv.Scalar(255, 0, 0, 255), 2);

    // draw label
    const label = `Class: ${box.class_id}, Conf: ${box.confidence.toFixed(2)}`;
    const textOrg = new cv.Point(
      x,
      y > 10 ? y - 5 : 10
    );
    cv.putText(
      maskedImg,
      label,
      textOrg,
      cv.FONT_HERSHEY_SIMPLEX,
      0.5,
      new cv.Scalar(255, 0, 0, 255),
      1
    );
    // draw mask on masked img
    //   cv::Mat roi = masked_img(box.bounding_box);
    // roi.setTo(mask_color, box.mask);
    // const roi = maskedImg.roi(new cv.Rect(box.bounding_box.x, box.bounding_box.y, box.bounding_box.width, box.bounding_box.height));
    // roi.setTo(maskColor, box.mask);
    // box.mask.copyTo(roi, box.mask);
    // roi.delete();
    if (
      box.mask &&
      width > 0 &&
      height > 0 &&
      x >= 0 &&
      y >= 0 &&
      x + width <= maskedImg.cols &&
      y + height <= maskedImg.rows
    ) {
      try {
        const rect = new cv.Rect(x, y, width, height);
        const roi = maskedImg.roi(rect);

        // Ensure mask matches ROI
        if (box.mask.rows === roi.rows && box.mask.cols === roi.cols) {
          const colored = new cv.Mat(roi.rows, roi.cols, roi.type(), new cv.Scalar(0, 255, 0, 100));
          cv.addWeighted(colored, 0.4, roi, 0.6, 0, roi, -1);
          colored.delete();
          box.mask.copyTo(roi, box.mask);
        }

        roi.delete();
      } catch (e) {
        // silently skip invalid mask/roi
      }
    }
  });

  return maskedImg;
};

// inputs: the results from an ONNX session, and the dimensions of the original unscaled frame
// outputs: list of processedResults; each containing the predicted card, in image corners, and confidence score
// export const processONNXSessionResults = (detections: ort.Tensor, proto: ort.Tensor, sourceFrame: Mat, cv: CV): processedResult[] => {
export const processONNXSessionResults = (
  cv: CV,
  detections: ort.Tensor,
  proto: ort.Tensor,
  sourceFrame: Mat,
  logging: boolean = false
): Mat => {
  const ret: processedResult[] = [];

  // get bounding boxes as a Mat object
  if (logging) console.log('getting raw boxes');
  const raw_boxes = getYoloBoxes(detections, cv);

  // Process bounding boxes
  if (logging) console.log('processing bounding boxes');
  const boxes: YoloBoundingBox[] = processYoloBoundingBoxes(
    raw_boxes,
    sourceFrame.size(),
    cv
  );

  // process segmentation masks
  if (logging) console.log('processing YOLO masks');
  const boxesWithMasks = processYOLOMasks(
    boxes,
    proto.data as Float32Array,
    proto.dims.slice(),
    sourceFrame.size(),
    cv,
    logging
  );

  if (logging) console.log('drawing boxes on frame');
  const annotatedFrame = drawOnFrame(boxesWithMasks, sourceFrame, cv);

  // cleanup
  for (let box of boxesWithMasks) {
    if (!box.mask.isDeleted()) {
      box.mask.delete();
    }
  }
  raw_boxes.delete();

  return annotatedFrame;
};
