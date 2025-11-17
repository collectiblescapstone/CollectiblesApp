import { LuCamera, LuLibrary, LuUser } from 'react-icons/lu';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const takePicture = async () => {
  await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri,
    webUseInput: !CameraSource.Camera,
    saveToGallery: false,
  });

  // image.webPath will contain a path that can be set as an image src.
  // You can access the original file using image.path, which can be
  // passed to the Filesystem API to read the raw data of the image,
  // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
  // var imageUrl = image.webPath;

  // Can be set to the src of an image now
  //imageElement.src = imageUrl;
};

export const MENU_ITEMS: {
  icon: React.ReactNode;
  path: string;
  name: string;
  onClick?: () => void;
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
