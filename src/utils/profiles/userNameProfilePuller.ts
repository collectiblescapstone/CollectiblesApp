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
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error('Failed to fetch user profile');
  }

  return response.data;
};
