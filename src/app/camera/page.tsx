'use client'

import { IdentifyCards } from '@/components/cv/IdentifyCards'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { Box, Button, Spinner, Heading, Text, VStack } from '@chakra-ui/react'
import TipsPopup from '@/components/ui/PopupUI'
import { releaseModel } from '@/utils/identification/loadModel'

import {
    CameraPreview,
    CameraPreviewOptions,
    CameraPreviewPictureOptions
} from '@capacitor-community/camera-preview'

import { Camera } from '@capacitor/camera'

import { Capacitor } from '@capacitor/core'

const CameraPage = () => {
    const [sourceImageData, setSourceImageData] = useState<ImageData | null>(
        null
    )
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
        'environment'
    )
    const inputCanvas = useRef<HTMLCanvasElement | null>(null)
    const overlayCanvas = useRef<HTMLCanvasElement | null>(null)
    const isCameraActive = useRef<boolean>(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const { session, loading } = useAuth()

    // Determine if running on iOS or native platform also use user-agent check to avoid issues with next.js dynamic imports of capacitor plugins on web
    const isIOS = Capacitor.getPlatform() === 'ios' || (typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent))
    const isNative = Capacitor.isNativePlatform()

    const stopCurrentStream = useCallback(async () => {
        try {
            if (isIOS && isNative) {
                await CameraPreview.stop()
                isCameraActive.current = false
            } else {
                if (streamRef.current) {
                    streamRef.current
                        .getTracks()
                        .forEach((track) => track.stop())
                    streamRef.current = null
                }
                isCameraActive.current = false
            }
        } catch (err) {
            console.error('Error stopping camera preview', err)
        }
    }, [isIOS, isNative])

    // Called by IdentifyCards when it's ready for the next frame
    const handleProcessed = useCallback(() => {
        setTimeout(async () => {
            if (!isCameraActive.current) return
            let width
            let height
            let toDraw: HTMLVideoElement | HTMLImageElement
            if (isIOS && isNative) {
                const pictureOptions: CameraPreviewPictureOptions = {
                    quality: 90,
                    width: 1280,
                    height: 1280
                }
                const result = await CameraPreview.capture(pictureOptions)
                const img = new Image()
                img.crossOrigin = 'anonymous'
                await new Promise((resolve, reject) => {
                    img.onload = resolve
                    img.onerror = reject
                    img.src = Capacitor.convertFileSrc(result.value)
                })
                width = img.width
                height = img.height
                toDraw = img
            } else {
                if (!videoRef.current) return
                if (videoRef.current.paused || videoRef.current.ended) return
                width = videoRef.current.videoWidth
                height = videoRef.current.videoHeight
                toDraw = videoRef.current
            }

            // create canvas if not exists
            if (!inputCanvas.current) {
                inputCanvas.current = document.createElement('canvas')
            }
            const canvas = inputCanvas.current

            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (!ctx) return

            // draw video centered while cutting off edges to fit model input size
            const videoAspect = width / height
            let sx = 0,
                sy = 0,
                sWidth = width,
                sHeight = height

            if (videoAspect > 1) {
                // video is wider than canvas
                sWidth = height
                sx = (width - sWidth) / 2
            } else {
                // video is taller than canvas
                sHeight = width
                sy = (height - sHeight) / 2
            }
            canvas.width = sWidth
            canvas.height = sHeight

            // grab frame from video, cropped to square
            ctx.drawImage(
                toDraw,
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
    }, [isIOS, isNative])

    const startCamera = useCallback(async () => {
        try {
            await Camera.requestPermissions({
                permissions: ['camera', 'photos']
            })
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : String(err)
            if (!errorMessage.includes('Not implemented on web')) {
                console.error('Error requesting camera permissions', err)
                return
            }
        }

        try {
            if (isIOS && isNative) {
                const cameraPreviewOptions: CameraPreviewOptions = {
                    parent: 'cameraPreview',
                    position: 'rear',
                    toBack: false,
                    disableAudio: true,
                    storeToFile: true,
                    enableOpacity: false,
                    height: 300,
                    width: 300
                }

                await CameraPreview.start(cameraPreviewOptions)
                isCameraActive.current = true
            } else {
                const video = videoRef.current
                if (!video) return
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: facingMode,
                        frameRate: { ideal: 20 },
                        width: { ideal: 1280 },
                        height: { ideal: 1280 }
                    }
                })

                streamRef.current = stream
                video.srcObject = stream
                await video.play()
                isCameraActive.current = true
            }
            handleProcessed()
        } catch (err) {
            console.error('Error accessing camera', err)
        }
    }, [handleProcessed, facingMode, isIOS, isNative])

    useEffect(() => {
        return () => {
            stopCurrentStream()
        }
    }, [stopCurrentStream])

    useEffect(() => {
        return () => {
            releaseModel()
        }
    }, [])

    const toggleCamera = async () => {
        try {
            if (isIOS && isNative) {
                await CameraPreview.flip()
            } else {
                stopCurrentStream()
                setFacingMode((prev) =>
                    prev === 'environment' ? 'user' : 'environment'
                )
            }
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
            <Box
                id="cameraPreview"
                position="relative"
                maxH="50vh"
                aspectRatio="1"
                mx="auto"
            >
                {!(isIOS && isNative) && (
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
                )}
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
            {!isCameraActive.current && (
                <Button onClick={startCamera}>Start Camera</Button>
            )}
            <Box className="block flex justify-center landscape:hidden">
                <Button onClick={toggleCamera}>Switch Camera</Button>
            </Box>
            {sourceImageData ? (
                <IdentifyCards
                    sourceImageData={sourceImageData}
                    onProcessed={handleProcessed}
                    overlayRef={isIOS ? null : overlayCanvas}
                    inputCanvasForIOS={isIOS ? inputCanvas : undefined}
                />
            ) : (
                <Box>No image captured.</Box>
            )}
            <TipsPopup.Viewport />
        </Box>
    )
}

export default CameraPage
