import { CV, Mat } from '@techstark/opencv-js'

import { CardData, CardDataObj } from '@/types/identification'
import path from 'path'
import fs from 'fs/promises'

let cardDataCacheServer: CardDataObj | null = null

export const CardClassifierServer = async (): Promise<
    (cv: CV, image: Mat, hashThreshold?: number) => CardData | null
> => {
    // Precompute the population count for all 8-bit numbers to speed up distance calculation
    const popCount8 = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
        let x = i
        let count = 0
        while (x) {
            x &= x - 1
            count++
        }
        popCount8[i] = count
    }

    /**
     * Converts hexadecimal string to byte array
     */
    const hexToBytes = (hex: string): Uint8Array => {
        const len = hex.length >> 1
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
        }
        return bytes
    }

    /**
     * Loads the card data into memory
     */
    const loadCards = async () => {
        if (cardDataCacheServer) {
            return cardDataCacheServer
        }
        const filePath = path.join(process.cwd(), 'public', 'card_data.json')
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const cardData = JSON.parse(fileContent) as CardDataObj
        for (const id in cardData) {
            cardData[id].hashBytes = hexToBytes(cardData[id].hash)
        }

        cardDataCacheServer = cardData
        return cardData
    }

    const cardData = await loadCards()

    /**
     * Returns the hexadecimal representation of a boolean array
     */
    const getHex = (binaryArray: boolean[]): string => {
        const bin = binaryArray.reduce(
            (str, val) => str + (val ? '1' : '0'),
            ''
        )
        let hex = ''
        for (let i = 0; i < bin.length; i += 4) {
            const chunk = bin.substring(i, i + 4)
            hex += parseInt(chunk, 2).toString(16).padStart(1, '0')
        }
        return hex
    }

    /**
     * Calculates difference hash
     * Reference: https://github.com/JohannesBuchner/imagehash/blob/4e289ebe056b961aa19fb1b50f5bdc66c87e0d55/imagehash/__init__.py#L304
     */
    const dhash = (cv: CV, image: Mat, hashSize = 16): string => {
        // Resize image to a (hashSize + 1) x (hashSize) image; the hash is computed from the first channel of the resized pixels
        const resizedImage = new cv.Mat()
        const dsize = new cv.Size(hashSize + 1, hashSize)
        cv.resize(image, resizedImage, dsize, 0, 0, cv.INTER_AREA)

        // Get (hashSize) x (hashSize) boolean array by checking if each pixel (other than last column) is smaller than its right pixel
        const pixels = new Array<boolean>(hashSize * hashSize)
        for (let row = 0; row < hashSize; row++) {
            for (let col = 0; col < hashSize; col++) {
                pixels[row * hashSize + col] =
                    resizedImage.ucharPtr(row, col)[0] <
                    resizedImage.ucharPtr(row, col + 1)[0]
            }
        }

        resizedImage.delete()
        return getHex(pixels)
    }

    /**
     * Given a card image, returns the most similar card
     */
    const getSimilarCards = (
        cv: CV,
        image: Mat,
        hashThreshold: number = 0.28
    ) => {
        image.convertTo(image, cv.CV_8UC3)
        const channels = new cv.MatVector()
        cv.split(image, channels)
        const imageR = channels.get(0)
        const imageG = channels.get(1)
        const imageB = channels.get(2)
        const dHash =
            dhash(cv, imageR, 16) +
            dhash(cv, imageG, 16) +
            dhash(cv, imageB, 16)
        imageR.delete()
        imageG.delete()
        imageB.delete()
        channels.delete()

        const dHashBytes = hexToBytes(dHash)
        let bestDist = Infinity
        let bestId = 'base1-1'

        for (const id in cardData) {
            let dist = 0
            const cardBytes = cardData[id].hashBytes
            for (let i = 0; i < dHashBytes.length; i++) {
                dist += popCount8[dHashBytes[i] ^ cardBytes[i]]
            }

            if (dist < bestDist) {
                bestDist = dist
                bestId = id
            }
        }

        // If the distance is above the threshold, return null
        if (bestDist / (dHashBytes.length * 8) > hashThreshold) {
            return null
        }

        return cardData[bestId]
    }

    return getSimilarCards
}
