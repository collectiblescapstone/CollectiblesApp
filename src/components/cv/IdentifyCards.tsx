'use client'

import { useRef, useEffect, useState } from 'react'
import { Box, ScrollArea, Text, VStack } from '@chakra-ui/react'

import { PredictedCards } from '@/types/identification'
import cvReadyPromise, { CV } from '@techstark/opencv-js'
import { locateWithYOLO } from '@/utils/identification/locateWithYOLO'
import { CardClassifier } from '@/utils/identification/classifyNormalizedCard'
import { IdentifiedCard } from './IdentifiedCard'
import { useAuth } from '@/context/AuthProvider'
import { Capacitor, CapacitorHttp } from '@capacitor/core'
import { baseUrl } from '@/utils/constants'

interface IdentifyCardsProps {
    sourceImageData?: ImageData
    onProcessed: () => void
    overlayRef: React.RefObject<HTMLCanvasElement | null> | null
    inputCanvasForIOS?: React.RefObject<HTMLCanvasElement | null>
}

export const IdentifyCards = ({
    sourceImageData,
    onProcessed,
    overlayRef,
    inputCanvasForIOS
}: IdentifyCardsProps) => {
    const isProcessing = useRef<boolean>(false)
    const cv = useRef<CV | null>(null)

    const [predictedCards, setPredictedCards] = useState<PredictedCards>()
    const [instantAddedCards, setInstantAddedCards] = useState<string[]>([]) // list of ids that have been instant added

    const { session } = useAuth()

    // Determine if running on iOS or native platform also use user-agent check to avoid issues with next.js dynamic imports of capacitor plugins on web
    const isIOS =
        Capacitor.getPlatform() === 'ios' ||
        (typeof navigator !== 'undefined' &&
            /iPad|iPhone|iPod/.test(navigator.userAgent))

    useEffect(() => {
        // called when new image data is made available by parent, runs the whole identification pipeline and updates state with results
        const processImage = async (
            imageData: ImageData,
            onProcessed: () => void
        ) => {
            if (isProcessing.current) return
            isProcessing.current = true

            if (isIOS) {
                if (!inputCanvasForIOS?.current) {
                    console.error(
                        'Input canvas ref not provided for iOS processing.'
                    )
                    isProcessing.current = false
                    onProcessed()
                    return
                }
                const imageDataUrl = inputCanvasForIOS.current.toDataURL(
                    'image/jpeg',
                    0.85
                )

                const response = await CapacitorHttp.post({
                    url: `${baseUrl}/api/identify-card`,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: { imageDataUrl }
                })

                if (response.status === 200) {
                    const predictedCards: PredictedCards =
                        response.data.predictedCards
                    setPredictedCards(predictedCards)
                } else {
                    console.error(
                        'Failed to identify cards on server:',
                        response.data
                    )

                    // return without setting isProcessing to false or calling onProcessed to prevent further processing attempts so server isn't spammed
                    return
                }
            } else {
                // get openCV instance
                if (!cv.current) {
                    const cvInstance = await cvReadyPromise
                    cv.current = cvInstance
                }

                const res = await locateWithYOLO(imageData, cv.current!, false)

                // display overlay of detected cards in parent component
                if (res && res.results.length > 0 && overlayRef) {
                    overlayRef.current!.width = res.overlay.width
                    overlayRef.current!.height = res.overlay.height
                    overlayRef
                        .current!.getContext('2d')!
                        .putImageData(res.overlay, 0, 0)
                }

                // for each detected card
                const classifier = await CardClassifier()
                const similar: PredictedCards = []
                for (const card of res?.results ?? []) {
                    // find most similar card
                    const mostSimilarCards = classifier(cv.current!, card.image)
                    similar.push({
                        data: mostSimilarCards,
                        imageURL: mostSimilarCards.card.image + '/low.jpg'
                    })
                }
                setPredictedCards(similar)

                // cleanup
                for (const r of res?.results ?? []) {
                    if (r.image && !r.image.isDeleted()) {
                        r.image.delete()
                    }
                }
            }

            isProcessing.current = false
            onProcessed()
        }
        if (sourceImageData) {
            processImage(sourceImageData, onProcessed)
        }
    }, [sourceImageData, onProcessed, overlayRef, inputCanvasForIOS, isIOS])

    useEffect(() => {
        // remove instant added cards that are no longer identified
        setInstantAddedCards((prev) =>
            prev.filter((id) =>
                predictedCards?.some((card) => card.data.card.id === id)
            )
        )
    }, [predictedCards])

    return (
        <Box>
            <Text textAlign="center">Identified Cards</Text>
            <ScrollArea.Root style={{ width: '100%', height: '40vh' }}>
                <ScrollArea.Viewport>
                    <ScrollArea.Content>
                        <VStack>
                            {predictedCards ? (
                                predictedCards.map((card, index) => (
                                    <IdentifiedCard
                                        key={index}
                                        data={card.data}
                                        imageURL={card.imageURL}
                                        session={session}
                                        instantAdded={instantAddedCards.includes(
                                            card.data.card.id
                                        )}
                                        onInstantAdd={() => {
                                            setInstantAddedCards((prev) => [
                                                ...prev,
                                                card.data.card.id
                                            ])
                                        }}
                                    ></IdentifiedCard>
                                ))
                            ) : (
                                <Text>No cards identified.</Text>
                            )}
                        </VStack>
                    </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar />
            </ScrollArea.Root>
        </Box>
    )
}
