import { CardClassifier } from '@/utils/identification/classifyNormalizedCard'
import cvReadyPromise from '@techstark/opencv-js'

import { PredictedImageResult, rotation } from '@/types/identification'
import { locateWithYOLO } from './locateWithYOLO'

/**
 * DELETE foundCardImage after use to free up memory
 *
 * Identifies the card in the image at the given src URL
 * returns undefined if no card found, otherwise returns ProcessedImageResult
 *
 * @param src - URL of the image to identify the card in
 * @returns ProcessedImageResult | undefined
 */
export const IdentifyCardInImage = async (
    src: string,
    rot: rotation = rotation.NONE
): Promise<PredictedImageResult | undefined> => {
    if(!rot) console.log("fuck the linter bro")

    const cv = await cvReadyPromise

    // get imagedata from src
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    await new Promise((resolve) => {
        img.onload = resolve
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const result = await locateWithYOLO(imageData, cv, false)

    const first = result?.results[0]

    if (!first || !first.image) {
        return undefined
    }

    const classifier = await CardClassifier()

    const similarCards = classifier(cv, first.image)

    const ret: PredictedImageResult = {
        predictedCard: similarCards[0],
        foundCardImage: first?.image,
        corners: first?.corners
    }

    return ret
}
