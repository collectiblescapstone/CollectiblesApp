'use client'

import { IdentifyCards } from '@/components/cv/IdentifyCards'
import { useState, useEffect, useRef, useCallback, use } from 'react'
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
import TipsPopup from '@/components/ui/PopupUI'

const CameraPage = () => {
    const [sourceImageData, setSourceImageData] = useState<ImageData | null>(
        null
    )
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
        'environment'
    )
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const inputCanvas = useRef<HTMLCanvasElement | null>(null)
    const overlayCanvas = useRef<HTMLCanvasElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const { session, loading } = useAuth()

    const stopCurrentStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
    }

    const startCamera = useCallback(async () => {
        const video = videoRef.current
        if (!video) return

        try {
            stopCurrentStream()

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: facingMode,
                    frameRate: { ideal: 20 }
                }
            })

            streamRef.current = stream
            video.srcObject = stream
            await video.play()

            handleProcessed()
        } catch (err) {
            console.error('Error accessing camera', err)
        }
    }, [facingMode])

    // Called by IdentifyCards when it's ready for the next frame
    const handleProcessed = useCallback(() => {
        setTimeout(() => {
            if (!videoRef.current) return
            if (videoRef.current.paused || videoRef.current.ended) return
            const video = videoRef.current

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
        startCamera()
        return () => {
            stopCurrentStream()
        }
    }, [startCamera, loading, session])

    const toggleCamera = () => {
        setFacingMode((prev) =>
            prev === 'environment' ? 'user' : 'environment'
        )
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
                <video
                    ref={videoRef}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        border: '2px solid var(--chakra-colors-brand-turtoise)'
                    }}
                />
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
            <div className="block flex justify-center landscape:hidden">
                <Button onClick={toggleCamera}>
                    Switch to {facingMode === 'environment' ? 'Front' : 'Rear'}{' '}
                    Camera
                </Button>
            </div>
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
