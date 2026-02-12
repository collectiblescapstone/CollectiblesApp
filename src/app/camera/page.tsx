'use client';

import { IdentifyOneCard } from '@/components/cv/IdentifyOneCard';
import { Box } from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MODEL_INPUT_WIDTH, MODEL_INPUT_HEIGHT } from '@/utils/constants';

const CameraPage = () => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Called by IdentifyOneCard when it's ready for the next frame
  const handleProcessed = useCallback(() => {
    setTimeout(() => {
      if (!videoRef.current) return;

      const video = videoRef.current;

      // create canvas if not exists
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      // canvas.width = video.videoWidth;
      // canvas.height = video.videoHeight;
      canvas.width = MODEL_INPUT_WIDTH;
      canvas.height = MODEL_INPUT_HEIGHT;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // draw video centered while cutting off edges to fit model input size
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;
      let sx = 0,
        sy = 0,
        sWidth = video.videoWidth,
        sHeight = video.videoHeight;

      if (videoAspect > canvasAspect) {
        // video is wider than canvas
        sWidth = video.videoHeight * canvasAspect;
        sx = (video.videoWidth - sWidth) / 2;
      } else {
        // video is taller than canvas
        sHeight = video.videoWidth / canvasAspect;
        sy = (video.videoHeight - sHeight) / 2;
      }
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

      const dataUrl = canvas.toDataURL('image/jpeg');

      setImgUrl(dataUrl);
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
      {imgUrl ? (
        <IdentifyOneCard image={imgUrl} onProcessed={handleProcessed} />
      ) : (
        <Box>No image captured.</Box>
      )}
    </Box>
  );
};

export default CameraPage;
