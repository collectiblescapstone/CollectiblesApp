import { LuCamera, LuLibrary, LuUser } from 'react-icons/lu';
import { Camera, CameraResultType } from '@capacitor/camera';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const takePicture = async (router: AppRouterInstance) => {
  let isCameraAvailable;
  try {
    await navigator.mediaDevices?.getUserMedia({
      video: true,
    });
    isCameraAvailable = true;
  } catch (error) {
    // Suppress errors if camera is not available
    console.log('Error accessing camera:', error);
    isCameraAvailable = false;
  }

  let image;
  try {
    image = await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      webUseInput: isCameraAvailable ? false : true,
      saveToGallery: false,
    });
  } catch (error) {
    // Suppress user cancellation errors
    console.log('Error taking picture:', error);
    return;
  }

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
    // onClick: takePicture,
  },
  { icon: <LuUser size={36} />, path: '/personal-profile', name: 'Profile' },
];

export const MAIN_PAGES = [
  '/',
  '/pokemon-grid',
  '/camera',
  '/personal-profile',
];
