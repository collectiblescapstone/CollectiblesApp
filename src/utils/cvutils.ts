// automatically translated from NolanAmblard/Pokemon-Card-Scanner/blob/main/utils.py
// TODO: reference https://stackoverflow.com/questions/51528462/opencv-js-perspective-transform and rewrite by hand

import { MatVector, Mat } from "@techstark/opencv-js";

//  Returns the corners & area of the biggest contour
export function biggestContour(
  cv: any,
  contours: MatVector
): { biggest: any | null; maxArea: number } {
  let biggest: any | null = null;
  let maxArea = 0;

  // loop through contours
  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i);
    const area = cv.contourArea(cnt); // get area of contour
    if (area > 5000) {
      const peri = cv.arcLength(cnt, true); // get perimeter
      const approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * peri, true); // get number of sides
      
      // approx.rows = number of sides
      if (area > maxArea && approx.rows === 4) {
        biggest = approx;
        maxArea = area;
      } else {
        approx.delete();
      }
    }
  }
  return { biggest, maxArea };
}

// reorderCorners: input may be a contour approximation (Mat) or nested arrays.
// Returns corners in format [[topleft],[topright],[bottomleft],[bottomright]]
export function reorderCorners(cv: any, cornersInput: any): any {
  // Normalize input into an array of 4 points [x,y]
  let corners: [number, number][] = [];

  if (!cornersInput) {
    return [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]];
  }

  // If input is an OpenCV Mat approx with shape (4,1,2)
  if (
    typeof cornersInput.rows === 'number' &&
    typeof cornersInput.data32S !== 'undefined'
  ) {
    // read points from Mat
    for (let i = 0; i < cornersInput.rows; i++) {
      const x = cornersInput.intAt(i, 0);
      const y = cornersInput.intAt(i, 1);
      corners.push([x, y]);
    }
  } else if (Array.isArray(cornersInput)) {
    // Support shapes like [[ [x,y] ], [ [x,y] ], ...] or [ [x,y], ... ]
    if (cornersInput.length >= 4) {
      for (let i = 0; i < 4; i++) {
        const v = cornersInput[i];
        if (Array.isArray(v)) {
          // nested [[x,y]] or [x,y]
          if (Array.isArray(v[0])) {
            const p = v[0] as number[];
            corners.push([p[0] || 0, p[1] || 0]);
          } else {
            const p = v as number[];
            corners.push([p[0] || 0, p[1] || 0]);
          }
        } else {
          corners.push([0, 0]);
        }
      }
    }
  }

  // Fallback: ensure 4 points
  while (corners.length < 4) corners.push([0, 0]);

  // Copy xvals and yvals
  const xvals = [corners[0][0], corners[1][0], corners[2][0], corners[3][0]];
  const yvals = [corners[0][1], corners[1][1], corners[2][1], corners[3][1]];

  // Sort yvals with indexes
  const { vals: sortedY, indexes: idxs } = sortVals(yvals.slice());
  // Reorder xvals to same order as sorted y
  const tempX = xvals.slice();
  for (let i = 0; i < idxs.length; i++) {
    xvals[i] = tempX[idxs[i]];
  }
  // if top two have same y, ensure left->right order
  if (sortedY[0] === sortedY[1]) {
    if (xvals[1] < xvals[0]) {
      const t = xvals[0];
      xvals[0] = xvals[1];
      xvals[1] = t;
    }
  }

  // distances from point 0 to others
  const dist1 = Math.hypot(xvals[1] - xvals[0], sortedY[1] - sortedY[0]);
  const dist2 = Math.hypot(xvals[2] - xvals[0], sortedY[2] - sortedY[0]);
  const dist3 = Math.hypot(xvals[3] - xvals[0], sortedY[3] - sortedY[0]);
  const dists = [dist1, dist2, dist3];

  const { vals: distSorted, indexes: idxsDistBase } = sortVals(dists.slice());
  // convert to 4-element index map similar to python version
  const idxsDist = [
    0,
    idxsDistBase[0] + 1,
    idxsDistBase[1] + 1,
    idxsDistBase[2] + 1,
  ];

  let topleft: [number, number];
  let topright: [number, number];
  let bottomright: [number, number];
  let bottomleft: [number, number];

  if (sortedY[0] === sortedY[1]) {
    if (dists[0] === distSorted[0]) {
      topleft = [xvals[idxsDist[0]], sortedY[idxsDist[0]]];
      topright = [xvals[idxsDist[1]], sortedY[idxsDist[1]]];
      bottomright = [xvals[idxsDist[3]], sortedY[idxsDist[3]]];
      bottomleft = [xvals[idxsDist[2]], sortedY[idxsDist[2]]];
    } else {
      topleft = [xvals[idxsDist[1]], sortedY[idxsDist[1]]];
      topright = [xvals[idxsDist[0]], sortedY[idxsDist[0]]];
      bottomright = [xvals[idxsDist[2]], sortedY[idxsDist[2]]];
      bottomleft = [xvals[idxsDist[3]], sortedY[idxsDist[3]]];
    }
  } else {
    const leftMost = Math.min(...xvals);
    if (xvals[idxsDist[1]] === leftMost) {
      topleft = [xvals[idxsDist[1]], sortedY[idxsDist[1]]];
      topright = [xvals[idxsDist[0]], sortedY[idxsDist[0]]];
      bottomright = [xvals[idxsDist[2]], sortedY[idxsDist[2]]];
      bottomleft = [xvals[idxsDist[3]], sortedY[idxsDist[3]]];
    } else {
      topleft = [xvals[idxsDist[0]], sortedY[idxsDist[0]]];
      topright = [xvals[idxsDist[1]], sortedY[idxsDist[1]]];
      bottomright = [xvals[idxsDist[3]], sortedY[idxsDist[3]]];
      bottomleft = [xvals[idxsDist[2]], sortedY[idxsDist[2]]];
    }
  }

  return [topleft, topright, bottomleft, bottomright];
}

export function sortVals(
  vals: number[]
): { vals: number[]; indexes: number[] } {
  const indexes = Array.from({ length: vals.length }, (_, i) => i);
  for (let i = 0; i < vals.length; i++) {
    let index = i;
    let minval = vals[i];
    for (let j = i; j < vals.length; j++) {
      if (vals[j] < minval) {
        minval = vals[j];
        index = j;
      }
    }
    swap(vals, i, index);
    swap(indexes, i, index);
  }
  return { vals, indexes };
}

export function swap<T>(arr: T[], ind1: number, ind2: number): void {
  const temp = arr[ind1];
  arr[ind1] = arr[ind2];
  arr[ind2] = temp;
}

// drawRectangle: draws lines between 4 corners on img (cv.Mat). corners in same format as reorderCorners output.
export function drawRectangle(cv: any, img: Mat, corners: any): any {
  const thickness = 10;
  try {
    const c0 = corners[0];
    const c1 = corners[1];
    const c2 = corners[2];
    const c3 = corners[3];
    const color = new cv.Scalar(0, 255, 0);
    cv.line(
      img,
      new cv.Point(c0[0], c0[1]),
      new cv.Point(c1[0], c1[1]),
      color,
      thickness
    );
    cv.line(
      img,
      new cv.Point(c0[0], c0[1]),
      new cv.Point(c2[0], c2[1]),
      color,
      thickness
    );
    cv.line(
      img,
      new cv.Point(c3[0], c3[1]),
      new cv.Point(c2[0], c2[1]),
      color,
      thickness
    );
    cv.line(
      img,
      new cv.Point(c3[0], c3[1]),
      new cv.Point(c1[0], c1[1]),
      color,
      thickness
    );
  } catch {
    // ignore drawing errors
  }
  return img;
}
