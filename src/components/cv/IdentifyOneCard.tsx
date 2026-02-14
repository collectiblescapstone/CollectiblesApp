'use client'

import { useRef, useEffect, useState } from 'react'
import { Box, Button, Flex, Image, Text } from '@chakra-ui/react'
import Link from 'next/link'

import { IdentifyCardInImage } from '@/utils/identification/identify'
import { PredictedImageResult, CardData } from '@/types/identification'
import cvReadyPromise from '@techstark/opencv-js'

interface NormalizeProps {
    image?: string
}

export const IdentifyOneCard = ({ image }: NormalizeProps) => {
    const originalImageRef = useRef<HTMLCanvasElement | null>(null)
    const ProcessedImageRef = useRef<HTMLCanvasElement | null>(null)

    const [predictedCard, setPredictedCard] = useState<CardData>()
    const [predictedCardImage, setPredictedCardImage] = useState<string>()

    const processImage = async (src: string) => {
        const result: PredictedImageResult | undefined =
            await IdentifyCardInImage(src)

        if (!result) {
            return
        }

        if (result.foundCardImage) {
            // show processed image in canvas
            const cv = await cvReadyPromise
            cv.imshow(ProcessedImageRef.current!, result.foundCardImage!)

            setPredictedCard(result.predictedCard)
            setPredictedCardImage(result.predictedCard?.card.image + '/low.jpg')

            result.foundCardImage!.delete()
        }
    }

    useEffect(() => {
        if (image) {
            processImage(image)
        }
    }, [image])

    return (
        <Box>
            <Box style={{ display: 'none' }}>
                <canvas ref={originalImageRef} />
            </Box>
            <Flex flexDirection="column">
                <Box maxHeight="40vh" justifyItems="center">
                    <Text>Found Card</Text>
                    <canvas
                        ref={ProcessedImageRef}
                        style={{ height: '30vh' }}
                    />
                </Box>
                <Box maxHeight="40vh" justifyItems="center">
                    <Text>Identified Card</Text>
                    <Image
                        src={predictedCardImage}
                        maxHeight="30vh"
                        alt="identified card"
                    ></Image>
                </Box>
            </Flex>
            <Flex
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                mt={1}
                gap={1}
            >
                <Text>
                    {predictedCard?.card.name} (
                    {predictedCard?.card.id.split('-')[1]})
                </Text>
                <Text>
                    From: {predictedCard?.card.set.name} (
                    {predictedCard?.card.set.id})
                </Text>
                <Link
                    href={{
                        pathname: '/edit-card',
                        query: {
                            cardId: predictedCard?.card.id ?? '',
                            imageUrl: predictedCard?.card.image ?? '',
                            cardName: `${predictedCard?.card.name ?? ''} (${predictedCard?.card.id.split('-')[1]})`,
                            cardSet: predictedCard?.card.set.name ?? ''
                        }
                    }}
                >
                    <Button maxW="40vw">Add To Collection</Button>
                </Link>
            </Flex>
        </Box>
    )
}
