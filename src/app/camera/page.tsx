'use client';

import {
  CameraPreview,
  CameraPreviewOptions,
} from '@capacitor-community/camera-preview';
import { useEffect } from 'react';

const CameraPage = () => {
  const cameraPreviewOptions: CameraPreviewOptions = {
    parent: 'cameraPreview',
    width: window.innerWidth,
    height: window.innerHeight,
    position: 'rear',
  };

  useEffect(() => {
    CameraPreview.start(cameraPreviewOptions);
  }, []);
  return <div id="cameraPreview">Camera Page</div>;
};

export default CameraPage;
