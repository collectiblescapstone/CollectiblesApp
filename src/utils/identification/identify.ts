import { CardClassifier } from '@/utils/identification/classifyNormalizedCard'
import cvReadyPromise from '@techstark/opencv-js'

import { PredictedImageResult } from '@/types/identification'
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
    src: string
): Promise<{res: PredictedImageResult, speeds: {label:string, time:number}[]} | undefined> => {
    const speeds: {label:string, time:number}[] = []
    let lastTime = performance.now()
    const cv = await cvReadyPromise
    speeds.push({label: 'load cv', time: performance.now() - lastTime})
    lastTime = performance.now()

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

    speeds.push({label: 'load image and get data', time: performance.now() - lastTime})
    
    const result = await locateWithYOLO(imageData, cv, false)
    const first = result?.results[0]
    const locateWithYOLOSpeeds = result?.speeds ?? []
    speeds.push(...locateWithYOLOSpeeds)
    lastTime = performance.now()

    if (!first || !first.image) {
        return undefined
    }

    
    const classifier = await CardClassifier()
    speeds.push({label: 'load classifier', time: performance.now() - lastTime})
    lastTime = performance.now()

    const similarCards = classifier(cv, first.image)
    speeds.push({label: 'classify card', time: performance.now() - lastTime})
    lastTime = performance.now()


    // cleanup
    for (const r of result?.results ?? []) {
        if (r.image && !r.image.isDeleted()) {
            r.image.delete()
        }
    }

    const ret: PredictedImageResult = {
        predictedCard: similarCards[0],
        foundCardImage: first?.image,
        corners: first?.corners
    }

    speeds.push({label: 'cleanup', time: performance.now() - lastTime})

    return {res: ret, speeds}
}
