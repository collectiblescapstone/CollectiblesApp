import { LuCamera, LuLibrary, LuUser } from 'react-icons/lu';
import { Camera, CameraResultType } from '@capacitor/camera';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const takePicture = async (router: AppRouterInstance) => {
  const isCameraAvailable = await navigator.mediaDevices?.getUserMedia({
    video: true,
  });

  const image = await Camera.getPhoto({
    quality: 100,
    allowEditing: true,
    resultType: CameraResultType.Uri,
    webUseInput: isCameraAvailable ? false : true,
    saveToGallery: false,
  });

  if (image && image.webPath) {
    router.push(`/camera?img=${encodeURIComponent(image.webPath)}`);
  }
};

export const MENU_ITEMS: {
  icon: React.ReactNode;
  path: string;
  name: string;
  onClick?: (router: AppRouterInstance) => void;
}[] = [
  {
    icon: <LuLibrary size={36} />,
    path: '/pokemon-grid',
    name: 'Collections',
  },
  {
    icon: <LuCamera size={36} />,
    path: '/camera',
    name: 'Camera',
    onClick: takePicture,
  },
  { icon: <LuUser size={36} />, path: '/personal-profile', name: 'Profile' },
];

export const MAIN_PAGES = [
  '/',
  '/pokemon-grid',
  '/camera',
  '/personal-profile',
];
