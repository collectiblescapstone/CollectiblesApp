import { NextResponse } from 'next/server'
import { locateWithYOLOServer } from '@/utils/identification/server/locateWithYOLOServer'
import cvReadyPromise, { CV } from '@techstark/opencv-js'
import { CardClassifierServer } from '@/utils/identification/server/classifyNormalizedCardServer'
import { PredictedCards } from '@/types/identification'

let cvInstance: CV | null = null

const getCVInstance = async (): Promise<CV> => {
    if (cvInstance) {
        return cvInstance
    }
    cvInstance = await cvReadyPromise
    return cvInstance
}

export const POST = async (request: Request) => {
    try {
        const { default: sharp } = await import('sharp')
        const buffer = Buffer.from(await request.arrayBuffer())

        const { data, info } = await sharp(buffer)
            .raw()
            .ensureAlpha()
            .toBuffer({ resolveWithObject: true })

        // create ImageData from raw pixel data (node.js and typescript compatible)
        const imageData: ImageData = {
            data: new Uint8ClampedArray(data),
            width: info.width,
            height: info.height,
            colorSpace: 'srgb'
        }

        const cv = await getCVInstance()

        const doLogging = false
        console.log('Running locateWithYOLOServer...')
        const res = await locateWithYOLOServer(imageData, cv, doLogging)

        console.log('locateWithYOLOServer completed. Running CardClassifier...')
        // for each detected card
        const classifier = await CardClassifierServer()
        const similar: PredictedCards = []
        for (const card of res?.results ?? []) {
            // find most similar card
            const similarCards = classifier(cv, card.image)
            if (similarCards.length > 0) {
                // update list of identified cards with closest result
                similar.push({
                    data: similarCards[0],
                    imageURL: similarCards[0].card.image + '/low.jpg'
                })
            }
        }
        console.log('CardClassifier completed.')

        // cleanup
        for (const r of res?.results ?? []) {
            if (r.image && !r.image.isDeleted()) {
                r.image.delete()
            }
        }

        console.log('Returning response with predicted cards:', similar)
        return NextResponse.json({ predictedCards: similar })
    } catch (err) {
        console.error('Fetch error:', err)
        return NextResponse.json(
            { error: 'Failed to identify cards' },
            { status: 500 }
        )
    }
}
