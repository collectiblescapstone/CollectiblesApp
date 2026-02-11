import { UserProfile } from '@/types/personal-profile';
import { CapacitorHttp } from '@capacitor/core';

export const fetchUserProfile = async (
  userName: string
): Promise<UserProfile> => {
  const response = await CapacitorHttp.post({
    url: `/api/get-user-by-username`,
    data: { userName },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch user profile');
  }

  return response.data;
};
