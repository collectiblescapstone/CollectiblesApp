'use client'

import { useRef, useEffect, useState } from 'react'
import { Box, ScrollArea, Text, VStack } from '@chakra-ui/react'

import { CardData } from '@/types/identification'
import cvReadyPromise, { CV } from '@techstark/opencv-js'
import { locateWithYOLO } from '@/utils/identification/locateWithYOLO'
import { CardClassifier } from '@/utils/identification/classifyNormalizedCard'
import { IdentifiedCard } from './IdentifiedCard'
import { useAuth } from '@/context/AuthProvider'

interface IdentifyCardsProps {
    sourceImageData?: ImageData
    onProcessed: () => void
    overlayRef: React.RefObject<HTMLCanvasElement | null>
}

type PredictedCard = { data: CardData; imageURL: string }[]

export const IdentifyCards = ({
    sourceImageData,
    onProcessed,
    overlayRef
}: IdentifyCardsProps) => {
    const isProcessing = useRef<boolean>(false)
    const cv = useRef<CV>(null)

    const [predictedCards, setPredictedCards] = useState<PredictedCard>()
    const [instantAddedCards, setInstantAddedCards] = useState<string[]>([]) // list of ids that have been instant added

    const { session } = useAuth()

    useEffect(() => {
        // called when new image data is made available by parent, runs the whole identification pipeline and updates state with results
        const processImage = async (
            imageData: ImageData,
            onProcessed: () => void
        ) => {
            if (isProcessing.current) return
            isProcessing.current = true

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
            const similar: PredictedCard = []
            for (const card of res?.results ?? []) {
                // find most similar card
                const similarCards = classifier(cv.current!, card.image)
                if (similarCards.length > 0) {
                    // update list of identified cards with closest result
                    similar.push({
                        data: similarCards[0],
                        imageURL: similarCards[0].card.image + '/low.jpg'
                    })
                }
            }
            setPredictedCards(similar)

            isProcessing.current = false
            onProcessed()
        }
        if (sourceImageData) {
            processImage(sourceImageData, onProcessed)
        }
    }, [sourceImageData, onProcessed, overlayRef])

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
