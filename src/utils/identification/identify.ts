import { CardClassifier } from '@/utils/identification/classifyNormalizedCard'
import cvReadyPromise from '@techstark/opencv-js'

import { PredictedImageResult, rotation } from '@/types/identification'
import { locateWithYOLO } from './locateWithYOLO'

/**
 * DELETE foundCardImage after use to free up memory
 *
 * Identifies the card in the image at the given src URL
 * returns "NoCard" if no card found, "CantClassify" if card found but cannot be classified, otherwise returns ProcessedImageResult
 *
 * @param src - URL of the image to identify the card in
 * @returns ProcessedImageResult | string
 */
export const IdentifyCardInImage = async (
    src: string,
    rot: rotation = rotation.NONE
): Promise<PredictedImageResult | string> => {
    if (!rot) console.log('fuck the linter bro')

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
        return 'NoCard'
    }

    const classifier = await CardClassifier()

    const mostSimilarCard = classifier(cv, first.image)

    // cleanup
    for (const r of result?.results ?? []) {
        if (r.image && !r.image.isDeleted()) {
            r.image.delete()
        }
    }

    if (!mostSimilarCard) {
        return 'CantClassify'
    }

    const ret: PredictedImageResult = {
        predictedCard: mostSimilarCard,
        foundCardImage: first?.image,
        corners: first?.corners
    }

    return ret
}
