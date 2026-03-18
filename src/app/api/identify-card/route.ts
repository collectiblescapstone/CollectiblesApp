import { NextResponse } from 'next/server'
import { locateWithYOLOServer } from '@/utils/identification/server/locateWithYOLOServer'
import cvReadyPromise, { CV } from '@techstark/opencv-js'
import { CardClassifierServer } from '@/utils/identification/server/classifyNormalizedCardServer'
import { PredictedCards } from '@/types/identification'

export const runtime = 'nodejs'

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
        // load sharp dynamically to avoid issues with next.js and native modules, also only load in server environment
        const { default: sharp } = await import('sharp')
        const { imageDataUrl } = (await request.json()) as {
            imageDataUrl?: string
        }

        if (!imageDataUrl || typeof imageDataUrl !== 'string') {
            return NextResponse.json(
                { error: 'Missing imageDataUrl in request body' },
                { status: 400 }
            )
        }

        const dataUrlMatch = imageDataUrl.match(
            /^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/
        )
        if (!dataUrlMatch?.[1]) {
            return NextResponse.json(
                { error: 'Invalid imageDataUrl format' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(dataUrlMatch[1], 'base64')

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
        const res = await locateWithYOLOServer(imageData, cv, doLogging)

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

        // cleanup
        for (const r of res?.results ?? []) {
            if (r.image && !r.image.isDeleted()) {
                r.image.delete()
            }
        }

        return NextResponse.json({ predictedCards: similar })
    } catch (err) {
        console.error('Fetch error:', err)
        return NextResponse.json(
            { error: 'Failed to identify cards' },
            { status: 500 }
        )
    }
}
