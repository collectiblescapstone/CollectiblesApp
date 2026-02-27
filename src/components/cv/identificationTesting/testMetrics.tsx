'use client'

import React, { useState, ChangeEvent } from 'react'
import {
    Box,
    Button,
    Text,
    Badge,
    VStack,
    ScrollArea,
    HStack,
    Grid,
    GridItem
} from '@chakra-ui/react'
import { HiUpload } from 'react-icons/hi'

import { IdentifyCardInImage } from '@/utils/identification/identify'
import { rotation, PredictedImageResult } from '@/types/identification'
import cvReadyPromise from '@techstark/opencv-js'

type FileItem = {
    id: string
    file: File
    foundCard: PredictedImageResult
    cardId: string
}

const idFor = (f: File) => `${f.name}-${f.size}-${f.lastModified}`

export const TestMetrics = () => {
    const [files, setFiles] = useState<FileItem[]>([])
    const [accuracy, setAccuracy] = useState<number>(0)
    const [precision, setPrecision] = useState<number>(0)
    const [recall, setRecall] = useState<number>(0)
    const [f1Score, setF1Score] = useState<number>(0)
    const [speeds, setSpeeds] = useState<number[]>([])

    const updateCardId = (fileId: string, cardId: string): void => {
        setFiles((prevFiles) =>
            prevFiles.map((item) =>
                item.id === fileId ? { ...item, cardId } : item
            )
        )
    }

    const updateFoundCard = (
        fileId: string,
        foundCard: PredictedImageResult
    ): void => {
        setFiles((prevFiles) =>
            prevFiles.map((item) =>
                item.id === fileId ? { ...item, foundCard } : item
            )
        )
    }

    const clearAll = () => setFiles([])

    const identifyFiles = async () => {
        for (const { file, id } of files) {
            try {
                const imgSrc = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()

                    reader.onload = () => {
                        const dataUrl = reader.result as string
                        const img = new window.Image()

                        // load and process image
                        img.onload = () => {
                            const w = img.width
                            const h = img.height
                            const canvas = document.getElementById(
                                `canvas-${id}`
                            ) as HTMLCanvasElement
                            canvas.width = w
                            canvas.height = h
                            const ctx = canvas.getContext('2d')
                            ctx!.drawImage(img, 0, 0, w, h)
                            try {
                                resolve(canvas.toDataURL())
                            } catch (err) {
                                reject(err)
                            }
                        }

                        img.onerror = reject
                        img.src = dataUrl
                    }
                    reader.onerror = () => reject(reader.error)
                    reader.readAsDataURL(file)
                })

                // start timing
                const startTime = performance.now()

                // identify card in image
                const result: PredictedImageResult | undefined =
                    await IdentifyCardInImage(imgSrc, rotation.NONE)

                // end timing
                const endTime = performance.now()
                const duration = endTime - startTime
                setSpeeds((prevSpeeds) => [...prevSpeeds, duration])

                // update with results
                if (result && result.predictedCard) {
                    updateCardId(id, result.predictedCard.card.id)

                    // draw identified card image to canvas, and update foundCard
                    if (result.foundCardImage) {
                        updateFoundCard(id, result)

                        const cv = await cvReadyPromise
                        cv.imshow(`canvas-found-${id}`, result.foundCardImage)
                    }
                }
            } catch (err) {
                console.error('Error processing file', file.name, err)
            }
        }
    }

    const onFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const fl = e.target.files
        if (!fl) return

        const uploaded = Array.from(fl).map((file) => ({
            id: idFor(file),
            file,
            foundCard: {} as PredictedImageResult,
            cardId: 'NoCard'
        }))
        setFiles(uploaded)

        // clear input so the same file can be re-selected if needed
        e.currentTarget.value = ''
    }

    const updateMetrics = () => {
        let tp = 0
        let fp = 0
        let fn = 0
        let tn = 0
        for (const { file, cardId } of files) {
            const truth = file.name.split('.').slice(0, -1).join('.')

            const guess = cardId

            if (truth.includes('NoCard')) {
                if (guess === 'NoCard') {
                    tn++
                } else {
                    fp++
                }
            } else {
                if (guess === 'NoCard') {
                    fn++
                } else if (truth === guess) {
                    tp++
                } else {
                    fp++
                }
            }
        }

        setAccuracy((tp + tn) / (tp + tn + fp + fn))
        const precision = tp / (tp + fp + 0.000000001)
        setPrecision(precision)
        const recall = tp / (tp + fn + 0.000000001)
        setRecall(recall)
        setF1Score(
            (2 * (precision * recall)) / (precision + recall + 0.000000001)
        )
    }

    return (
        <HStack width="100%">
            <Box maxW="90vw" fontFamily="sans-serif" flex="1">
                <Text display="inline-flex">
                    1. Upload a series of test images named with the format
                    &quot;setid-cardnumber.jpg&quot; or &quot;NoCardxx.jpg&quot;
                    for images without cards.
                </Text>

                <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onFilesSelected}
                    style={{ display: 'none' }}
                />
                <label htmlFor="fileInput">
                    <Button as="span" variant="outline" size="sm">
                        <HiUpload /> Upload Test Images
                    </Button>
                </label>

                <br></br>
                <Text display="inline-flex">2. Run identifications</Text>
                <Button onClick={identifyFiles}>Run</Button>

                <VStack align="stretch">
                    <HStack>
                        <Text fontWeight="semibold">
                            Selected images <Badge ml={2}>{files.length}</Badge>
                        </Text>

                        {files.length > 0 ? (
                            <Button size="sm" onClick={clearAll}>
                                Clear
                            </Button>
                        ) : null}
                    </HStack>

                    {/* scrollable  container*/}
                    <ScrollArea.Root variant="hover" maxHeight="90vh">
                        <ScrollArea.Viewport>
                            <Grid
                                templateColumns="repeat(auto-fill, minmax(420px, 1fr))"
                                gap={4}
                            >
                                {files.map(({ id, file, cardId }) => (
                                    <GridItem
                                        key={id}
                                        padding="2"
                                        borderBottom="1px solid"
                                        borderColor="gray.200"
                                        backgroundColor={
                                            file.name
                                                .split('.')
                                                .slice(0, -1)
                                                .join('.')
                                                .includes('NoCard')
                                                ? cardId === 'NoCard'
                                                    ? 'green.500'
                                                    : 'red.500'
                                                : cardId ===
                                                    file.name
                                                        .split('.')
                                                        .slice(0, -1)
                                                        .join('.')
                                                  ? 'green.500'
                                                  : 'red.500'
                                        }
                                    >
                                        <HStack>
                                            <VStack>
                                                <Box
                                                    width="200px"
                                                    height="275px"
                                                >
                                                    <canvas
                                                        id={`canvas-${id}`}
                                                        style={{
                                                            width: '100%'
                                                        }}
                                                    />
                                                </Box>
                                                <Text flex="1">
                                                    {file.name
                                                        .split('.')
                                                        .slice(0, -1)
                                                        .join('.')}
                                                </Text>
                                            </VStack>
                                            <VStack>
                                                <Box
                                                    width="200px"
                                                    height="275px"
                                                >
                                                    <canvas
                                                        id={`canvas-found-${id}`}
                                                        style={{
                                                            width: '100%'
                                                        }}
                                                    />
                                                </Box>
                                                <Text
                                                    flex="1"
                                                    textAlign="right"
                                                    paddingRight="8"
                                                >
                                                    {cardId}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </GridItem>
                                ))}
                            </Grid>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar></ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                </VStack>
            </Box>
            <VStack width="10vw">
                <Text fontSize="lg" fontWeight="bold">
                    Metrics
                </Text>
                <Button onClick={updateMetrics}>Update</Button>
                <Box>
                    <Text fontWeight="semibold">Results:</Text>
                    <Text>
                        Speed (ms per image):{' '}
                        {speeds.length > 0
                            ? (
                                  speeds.reduce((a, b) => a + b, 0) /
                                  speeds.length
                              ).toFixed(2)
                            : 'N/A'}
                    </Text>
                    <Text>Accuracy: {accuracy.toFixed(2)}</Text>
                    <Text>Precision: {precision.toFixed(2)}</Text>
                    <Text>Recall: {recall.toFixed(2)}</Text>
                    <Text>F1 Score: {f1Score.toFixed(2)}</Text>
                </Box>
            </VStack>
        </HStack>
    )
}
