'use client';

import { IdentifyOneCard } from '@/components/cv/IdentifyOneCard';
import { Box } from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT } from '@/utils/constants';

const CameraPage = () => {
  const [sourceImageData, setSourceImageData] = useState<ImageData | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inputCanvas = useRef<HTMLCanvasElement | null>(null);

  // Called by IdentifyOneCard when it's ready for the next frame
  const handleProcessed = useCallback(() => {
    setTimeout(() => {
      if (!videoRef.current) return;

      const video = videoRef.current;

      // create canvas if not exists
      if (!inputCanvas.current) {
        inputCanvas.current = document.createElement('canvas');
      }
      const canvas = inputCanvas.current;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // draw video centered while cutting off edges to fit model input size
      const videoAspect = video.videoWidth / video.videoHeight;
      let sx = 0,
        sy = 0,
        sWidth = video.videoWidth,
        sHeight = video.videoHeight;

      if (videoAspect > 1) {
        // video is wider than canvas
        sWidth = video.videoHeight;
        sx = (video.videoWidth - sWidth) / 2;
      } else {
        // video is taller than canvas
        sHeight = video.videoWidth;
        sy = (video.videoHeight - sHeight) / 2;
      }
      canvas.width = sWidth;
      canvas.height = sHeight;

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
      );

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      setSourceImageData(imageData);
    }, 100);
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          // grab the first frame immediately
          handleProcessed();
        }
      } catch (err) {
        console.error('Error accessing camera', err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [handleProcessed]);

  return (
    <Box position="relative" minW="40dvw" minH="dvh">
      <video ref={videoRef} />
      {sourceImageData ? (
        <IdentifyOneCard sourceImageData={sourceImageData} onProcessed={handleProcessed} />
      ) : (
        <Box>No image captured.</Box>
      )}
    </Box>
  );
};

export default CameraPage;
