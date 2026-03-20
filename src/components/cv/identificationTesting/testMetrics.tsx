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
    GridItem,
    Image
} from '@chakra-ui/react'
import { HiUpload } from 'react-icons/hi'

import { IdentifyCardInImage } from '@/utils/identification/identify'
import { loadModel } from '@/utils/identification/loadModel'
import { CardClassifier } from '@/utils/identification/classifyNormalizedCard'

type FileItem = {
    id: string
    file: File
    foundCard: string
    cardId: string
}

const idFor = (f: File) => `${f.name}-${f.size}-${f.lastModified}`

export const TestMetrics = () => {
    const [files, setFiles] = useState<FileItem[]>([])
    const [accuracy, setAccuracy] = useState<number>(0)
    const [precision, setPrecision] = useState<number>(0)
    const [recall, setRecall] = useState<number>(0)
    const [f1Score, setF1Score] = useState<number>(0)
    const [speeds, setSpeeds] = useState<{ label: string; time: number }[][]>(
        []
    )

    const updateCardId = (fileId: string, cardId: string): void => {
        setFiles((prevFiles) =>
            prevFiles.map((item) =>
                item.id === fileId ? { ...item, cardId } : item
            )
        )
    }

    const updateFoundCard = (fileId: string, foundCard: string): void => {
        setFiles((prevFiles) =>
            prevFiles.map((item) =>
                item.id === fileId ? { ...item, foundCard } : item
            )
        )
    }

    const clearAll = () => setFiles([])

    const identifyFiles = async () => {
        // warmup model
        await loadModel('/models/card_yolo.onnx')
        await CardClassifier()

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

                // identify card in image
                const result = await IdentifyCardInImage(imgSrc)

                if (typeof result === 'string') {
                    updateCardId(id, result)
                    continue
                }

                if (typeof result !== 'string') {
                    setSpeeds((prev) => [...prev, result.speeds])
                }

                // update with results
                if (typeof result !== 'string' && result.res.predictedCard) {
                    updateCardId(id, result.res.predictedCard.card.id)

                    // draw identified card image to canvas, and update foundCard
                    if (result.res.foundCardImage) {
                        updateFoundCard(id, result.res.predictedCard.card.image)
                    }
                }
            } catch (err) {
                console.error('Error processing file', file.name, err)
            }
        }
    }

    const createCurve = async () => {
        // warmup model
        await loadModel('/models/card_yolo.onnx')
        await CardClassifier()

        const tests: { imgSrc: string, id: string }[] = []

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
                tests.push({ imgSrc, id: file.name.split('.').slice(0, -1).join('.') })
            } catch (err) {
                console.error('Error processing file', file.name, err)
            }
        }

        const resolution = 40

        const p = tests.filter(({ id }) => !id.toLowerCase().includes('nocard')).length
        const n = tests.filter(({ id }) => id.toLowerCase().includes('nocard')).length

        let results: { tpr: number, fpr: number }[] = []

        
        for (let i = 1; i <= resolution; i++) {
            let tp = 0
            let fp = 0
            for (const { imgSrc, id } of tests) {

                // identify card in image
                const result = await IdentifyCardInImage(imgSrc, 0.01, i / resolution)


                const guess = typeof result === 'string' ? result : result.res.predictedCard?.card.id ?? 'NoCard'

                const truth = id

                if (truth.toLowerCase().includes('nocard') && guess !== 'NoCard') {
                    fp++
                } else if (truth === guess) {
                    tp++
                }
            }

            console.log(`Threshold: ${(i / resolution).toFixed(2)}, TPR: ${(tp / p).toFixed(3)}, FPR: ${(fp / n).toFixed(3)}`)
            results.push({ tpr: tp / p, fpr: fp / n })
        }
        
        // remove duplicate points
        const uniquePoints: { tpr: number, fpr: number }[] = []
        results.forEach((point) => {
            if (!uniquePoints.some((p) => p.tpr === point.tpr && p.fpr === point.fpr)) {
                uniquePoints.push(point)
            }
        })

        // take point with highest TPR for each FPR, to avoid duplicates in curve
        const filteredPoints: { tpr: number, fpr: number }[] = []
        uniquePoints.forEach((point) => {
            const existing = filteredPoints.find((p) => p.fpr === point.fpr)
            if (!existing || point.tpr > existing.tpr) {
                // if no existing point with same FPR, or this point has higher TPR, add/update it
                const index = filteredPoints.findIndex((p) => p.fpr === point.fpr)
                if (index !== -1) {
                    filteredPoints[index] = point
                } else {
                    filteredPoints.push(point)
                }
            }
        })

        const msg = "# FPR,TPR\ndata = [\n" + filteredPoints.map((p) => `[${p.fpr.toFixed(3)},${p.tpr.toFixed(3)}],`).join('\n') + "\n]"
        console.log(msg)

    }

    const onFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const fl = e.target.files
        if (!fl) return

        const uploaded = Array.from(fl).map((file) => ({
            id: idFor(file),
            file,
            foundCard: '',
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

            if (truth.toLowerCase().includes('nocard')) {
                if (guess === 'NoCard' || guess === "CantClassify") {
                    tn++
                } else {
                    fp++
                }
            } else {
                if (guess === 'NoCard') {
                    fn++
                } else if (truth === guess || guess === "CantClassify") {
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
                <Button onClick={createCurve}>Calc Curve</Button>

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
                                {files.map(
                                    ({ id, file, cardId, foundCard }) => (
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
                                                    .toLowerCase()
                                                    .includes('nocard')
                                                    ? cardId === 'NoCard'
                                                        ? 'green.500'
                                                        : cardId === 'CantClassify'
                                                            ? 'yellow.500'
                                                            : 'red.500'
                                                    : cardId === 'CantClassify'
                                                        ? 'yellow.500'
                                                        :
                                                    cardId ===
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
                                                        {foundCard ? (
                                                            <Image
                                                                src={`${foundCard}/low.jpg`}
                                                                alt="found card"
                                                            />
                                                        ) : null}
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
                                    )
                                )}
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
                    {speeds[0] && speeds.length > 0
                        ? speeds[0].map(({ label }) => {
                              const totalTime = speeds.reduce(
                                  (sum, run) =>
                                      sum +
                                      (run.find(
                                          (entry) => entry.label === label
                                      )?.time ?? 0),
                                  0
                              )
                              const amount = speeds.filter((run) =>
                                  run.some((entry) => entry.label === label)
                              ).length
                              const avgTime = totalTime / amount

                              return (
                                  <React.Fragment key={label}>
                                      <Text>{label}</Text>
                                      <Text>{avgTime.toPrecision(4)}ms</Text>
                                  </React.Fragment>
                              )
                          })
                        : null}
                    <Text>Accuracy: {accuracy.toFixed(3)}</Text>
                    <Text>Precision: {precision.toFixed(3)}</Text>
                    <Text>Recall: {recall.toFixed(3)}</Text>
                    <Text>F1 Score: {f1Score.toFixed(3)}</Text>
                </Box>
            </VStack>
        </HStack>
    )
}
