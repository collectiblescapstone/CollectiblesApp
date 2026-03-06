'use client'

import { IdentifyCards } from '@/components/cv/IdentifyCards'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { Box, Button, Spinner, Heading, Text, VStack } from '@chakra-ui/react'
import TipsPopup from '@/components/ui/PopupUI'

const CameraPage = () => {
    const [sourceImageData, setSourceImageData] = useState<ImageData | null>(
        null
    )
    const inputCanvas = useRef<HTMLCanvasElement | null>(null)
    const overlayCanvas = useRef<HTMLCanvasElement | null>(null)
    const videoRef = useRef<HTMLDivElement | null>(null)
    const { session, loading } = useAuth()

    const stopCurrentStream = useCallback(() => {
        try {
            CameraPreview.stop()
        } catch (err) {
            console.error('Error stopping camera preview', err)
        }
    }, [])

    // Called by IdentifyCards when it's ready for the next frame
    const handleProcessed = useCallback(() => {
        setTimeout(async () => {
            let result
            try {
                result = await CameraPreview.capture({ quality: 85 })

            } catch (err) {
                console.error('Error capturing camera sample', err)
                return
            }

            const base64URL = result.value
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = base64URL
            await new Promise((resolve) => {
                img.onload = resolve
            })

            // create canvas if not exists
            if (!inputCanvas.current) {
                inputCanvas.current = document.createElement('canvas')
            }
            const canvas = inputCanvas.current

            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (!ctx) return

            // draw video centered while cutting off edges to fit model input size
            const videoAspect = img.width / img.height
            let sx = 0,
                sy = 0,
                sWidth = img.width,
                sHeight = img.height

            if (videoAspect > 1) {
                // video is wider than canvas
                sWidth = img.height
                sx = (img.width - sWidth) / 2
            } else {
                // video is taller than canvas
                sHeight = img.width
                sy = (img.height - sHeight) / 2
            }
            canvas.width = sWidth
            canvas.height = sHeight

            // grab frame from video, cropped to square
            ctx.drawImage(
                img,
                sx,
                sy,
                sWidth,
                sHeight,
                0,
                0,
                canvas.width,
                canvas.height
            )

            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            )

            setSourceImageData(imageData)
        }, 100)
    }, [])

    const startCamera = useCallback(async () => {

        // try {
        //     await Camera.requestPermissions()
        // } catch (err) {
        //     const errorMessage =
        //         err instanceof Error ? err.message : String(err)
        //     if (!errorMessage.includes('Not implemented on web')) {
        //         console.error('Error requesting camera permissions', err)
        //     }
        // }

        try {
            stopCurrentStream()

            const cameraPreviewOptions: CameraPreviewOptions = {
                parent: 'cameraPreview',
                position: 'rear',
                toBack: true,
                disableAudio: true
            }

            CameraPreview.start(cameraPreviewOptions)

            handleProcessed()
        } catch (err) {
            console.error('Error accessing camera', err)
        }
    }, [handleProcessed, stopCurrentStream])

    useEffect(() => {
        if (loading || !session) return
        startCamera()
        return () => {
            stopCurrentStream()
        }
    }, [startCamera, loading, session, stopCurrentStream])

    const toggleCamera = () => {
        try {
            CameraPreview.flip()
        } catch (err) {
            console.error('Error flipping camera', err)
        }
    }

    const tipsPopupContent = () => {
        return (
            <Box
                maxW="800px"
                width="100%"
                textAlign="center"
                padding="6"
                backgroundColor="#FFFFFF"
                borderRadius="md"
            >
                <Box as="article">
                    <VStack align="start">
                        <Box>
                            <Heading as="h3" size="sm" mb={2} textAlign="left">
                                Lighting
                            </Heading>
                            <Text textAlign="left">
                                Use bright, even lighting. Avoid shadows and
                                glare on the card surface.
                            </Text>
                        </Box>
                        <Box>
                            <Heading as="h3" size="sm" mb={2} textAlign="left">
                                Positioning
                            </Heading>
                            <Text textAlign="left">
                                Ensure the whole card is visible. Hold steady to
                                avoid blur.
                            </Text>
                        </Box>
                        <Box>
                            <Heading as="h3" size="sm" mb={2} textAlign="left">
                                For Best Results
                            </Heading>
                            <Text textAlign="left">
                                Have a single card visible, cards in binders may
                                be hard to recognize.
                            </Text>
                        </Box>
                    </VStack>
                </Box>
            </Box>
        )
    }

    // show tips popup on first load
    useEffect(() => {
        if (loading || !session) return
        TipsPopup.open('camera-tips', {
            title: 'Scanning Tips',
            description: 'For better card recognition, follow these tips:',
            content: tipsPopupContent(),
            onClickClose: () => {
                TipsPopup.close('camera-tips')
            }
        })
    }, [loading, session])

    if (loading || !session) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        )
    }

    return (
        <Box minW="39vw">
            <Box position="relative" maxH="50vh" aspectRatio="1" mx="auto">
                <div ref={videoRef} id="cameraPreview"></div>
                <canvas
                    ref={overlayCanvas}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                />
            </Box>
            {videoRef.current !== null && videoRef.current.children.length === 0 && (
                <Button onClick={startCamera}>Start Camera</Button>
            )}
            <Box className="block flex justify-center landscape:hidden">
                <Button onClick={toggleCamera}>
                    Switch Camera
                </Button>
            </Box>
            {sourceImageData ? (
                <IdentifyCards
                    sourceImageData={sourceImageData}
                    onProcessed={handleProcessed}
                    overlayRef={overlayCanvas}
                />
            ) : (
                <Box>No image captured.</Box>
            )}
            <TipsPopup.Viewport />
        </Box>
    )
}

export default CameraPage
