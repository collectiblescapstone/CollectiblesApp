'use client'

import { IdentifyCards } from '@/components/cv/IdentifyCards'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthProvider'
import {
    Box,
    Button,
    Spinner,
    Heading,
    Text,
    VStack,
    HStack
} from '@chakra-ui/react'
import { CameraPreview, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

const CameraPage = () => {
    const [sourceImageData, setSourceImageData] = useState<ImageData | null>(
        null
    )
    // const videoRef = useRef<HTMLVideoElement | null>(null)
    const inputCanvas = useRef<HTMLCanvasElement | null>(null)
    const overlayCanvas = useRef<HTMLCanvasElement | null>(null)
    const tipsPopupRef = useRef<HTMLDivElement | null>(null)
    const { session, loading } = useAuth()

    // Called by IdentifyCards when it's ready for the next frame
    const handleProcessed = useCallback(() => {
        setTimeout(() => {
            const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
                quality: 50
            };

            let result:string;
            
            try {
                result = await CameraPreview.capture(cameraPreviewPictureOptions);
            }

            // create canvas if not exists
            if (!inputCanvas.current) {
                inputCanvas.current = document.createElement('canvas')
            }
            const canvas = inputCanvas.current

            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (!ctx) return

            // draw video centered while cutting off edges to fit model input size
            const videoAspect = video.videoWidth / video.videoHeight
            let sx = 0,
                sy = 0,
                sWidth = video.videoWidth,
                sHeight = video.videoHeight

            if (videoAspect > 1) {
                // video is wider than canvas
                sWidth = video.videoHeight
                sx = (video.videoWidth - sWidth) / 2
            } else {
                // video is taller than canvas
                sHeight = video.videoWidth
                sy = (video.videoHeight - sHeight) / 2
            }
            canvas.width = sWidth
            canvas.height = sHeight

            // grab frame from video, cropped to square
            ctx.drawImage(
                video,
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

    useEffect(() => {
        if (loading || !session) return

        const startCamera = async () => {
            try {
                CameraPreview.start({ parent: "cameraPreview", position: "rear", width:1280, height:1280, disableAudio: true });
                
                // grab the first frame immediately
                handleProcessed()
            } catch (err) {
                console.error('Error accessing camera', err)
            }
        }

        startCamera()

    }, [handleProcessed, loading, session])

    window.addEventListener("beforeunload", () => {
        CameraPreview.stop();
    })

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
                {/* <video
                    ref={videoRef}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        border: '2px solid var(--chakra-colors-brand-turtoise)'
                    }}
                /> */}
                <div id="cameraPreview" style={{
                        position: 'absolute',
                    width: '100%',  
                        height: '100%',
                        objectFit: 'cover',
                        border: '2px solid var(--chakra-colors-brand-turtoise)'
                    }}></div>
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
            {sourceImageData ? (
                <IdentifyCards
                    sourceImageData={sourceImageData}
                    onProcessed={handleProcessed}
                    overlayRef={overlayCanvas}
                />
            ) : (
                <Box>No image captured.</Box>
            )}
            <Box
                ref={tipsPopupRef}
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                backgroundColor="#000000AA"
            >
                <Box
                    maxW="800px"
                    width="100%"
                    textAlign="center"
                    padding="6"
                    backgroundColor="#FFFFFF"
                    borderRadius="md"
                >
                    <Box as="article">
                        <HStack justifyContent="space-between" mb={6}>
                            <Heading as="h2" size="lg" mb={4}>
                                Tips for Better Card Scans
                            </Heading>
                            <Button
                                onClick={() => {
                                    // just hide the overlay, the camera will still be running underneath
                                    if (tipsPopupRef.current) {
                                        tipsPopupRef.current.style.display =
                                            'none'
                                    }
                                }}
                            >
                                Close
                            </Button>
                        </HStack>
                        <VStack align="start">
                            <Box>
                                <Heading
                                    as="h3"
                                    size="sm"
                                    mb={2}
                                    textAlign="left"
                                >
                                    Lighting
                                </Heading>
                                <Text textAlign="left">
                                    Use bright, even lighting. Avoid shadows and
                                    glare on the card surface.
                                </Text>
                            </Box>
                            <Box>
                                <Heading
                                    as="h3"
                                    size="sm"
                                    mb={2}
                                    textAlign="left"
                                >
                                    Positioning
                                </Heading>
                                <Text textAlign="left">
                                    Ensure the whole card is visible. Hold
                                    steady to avoid blur.
                                </Text>
                            </Box>
                            <Box>
                                <Heading
                                    as="h3"
                                    size="sm"
                                    mb={2}
                                    textAlign="left"
                                >
                                    For Best Results
                                </Heading>
                                <Text textAlign="left">
                                    Have a single card visible, cards in binders
                                    may be hard to recognize.
                                </Text>
                            </Box>
                        </VStack>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default CameraPage
