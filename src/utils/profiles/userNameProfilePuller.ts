import { UserProfile } from '@/types/personal-profile';
import { CapacitorHttp } from '@capacitor/core';
import { baseUrl } from '../constants';

export const fetchUserProfile = async (
  userName: string
): Promise<UserProfile> => {
  const response = await CapacitorHttp.post({
    url: `${baseUrl}/api/get-user-by-username`,
    data: { userName },
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*.vercel.app',
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch user profile');
  }

  return response.data;
};
