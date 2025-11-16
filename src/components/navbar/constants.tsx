import { LuCamera, LuLibrary, LuUser } from 'react-icons/lu';

export const MENU_ITEMS: {
  icon: React.ReactNode;
  path: string;
  name: string;
}[] = [
  {
    icon: <LuLibrary size={36} />,
    path: '/pokemon-grid',
    name: 'Collections',
  },
  { icon: <LuCamera size={36} />, path: '/camera', name: 'Camera' },
  { icon: <LuUser size={36} />, path: '/personal-profile', name: 'Profile' },
];

export const MAIN_PAGES = [
  '/',
  '/pokemon-grid',
  '/camera',
  '/personal-profile',
];
