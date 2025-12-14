import cvReadyPromise from '@techstark/opencv-js';

import { CardData, CardDataObj } from '@/types/identification';

export const CardClassifier = async (): Promise<
  (image: cvReadyPromise.Mat, k?: number) => CardData[]
> => {
  const cv = await cvReadyPromise;

  /**
   * Converts hexadecimal string to binary string
   */
  const hexToBin = (hex: string) => {
    let bits = '';
    for (const char of hex) {
      bits += parseInt(char, 16).toString(2).padStart(4, '0');
    }

    return bits;
  };

  /**
   * Loads the card data into memory
   */
  const loadCards = async () => {
    const cardDataReq = await fetch('/card_data.json');
    if (!cardDataReq.ok) {
      return {} as CardDataObj;
    }

    const cardData = (await cardDataReq.json()) as CardDataObj;
    for (const id in cardData) {
      cardData[id].hashBits = hexToBin(cardData[id].hash);
    }

    return cardData;
  };

  const cardData = await loadCards();

  /**
   * Returns the binary representation of a boolean array
   */
  const getBits = (binaryArray: boolean[]) =>
    binaryArray.reduce((str, val) => str + (val ? '1' : '0'), '');

  /**
   * Calculates difference hash
   * Reference: https://github.com/JohannesBuchner/imagehash/blob/4e289ebe056b961aa19fb1b50f5bdc66c87e0d55/imagehash/__init__.py#L304
   */
  const dhash = (image: cvReadyPromise.Mat, hashSize = 16): string => {
    // Convert image to a greyscale (hashSize + 1) x (hashSize) image
    const grayImage = new cv.Mat();
    cv.cvtColor(image, grayImage, cv.COLOR_RGB2GRAY);

    const resizedImage = new cv.Mat();
    const dsize = new cv.Size(hashSize + 1, hashSize);
    cv.resize(grayImage, resizedImage, dsize, 0, 0, cv.INTER_AREA);

    // Get (hashSize) x (hashSize) boolean array by checking if each pixel (other than last column) is smaller than its right pixel
    const pixels = new Array<boolean>(hashSize * hashSize);
    for (let row = 0; row < hashSize; row++) {
      for (let col = 0; col < hashSize; col++) {
        pixels[row * hashSize + col] =
          resizedImage.ucharPtr(row, col)[0] <
          resizedImage.ucharPtr(row, col + 1)[0];
      }
    }

    return getBits(pixels);
  };

  /**
   * Given a card image, returns the (k) most similar card(s)
   */
  const getSimilarCards = (image: cvReadyPromise.Mat, k = 4) => {
    const dHash = dhash(image);
    const distances: [distance: number, id: string][] = [];
    for (const id in cardData) {
      let distance = 0;
      for (let i = 0; i < dHash.length; i++) {
        if (dHash[i] !== cardData[id].hashBits[i]) {
          distance++;
        }
      }

      distances.push([distance, id]);
    }

    distances.sort((a, b) => a[0] - b[0]);
    return distances.slice(0, k).map(([, id]) => cardData[id]);
  };

  return getSimilarCards;
};
