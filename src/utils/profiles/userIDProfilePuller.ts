import { UserProfile } from '@/types/personal-profile';
import { CapacitorHttp } from '@capacitor/core';

export const fetchUserProfile = async (
  userID: string
): Promise<UserProfile> => {
  const response = await CapacitorHttp.post({
    url: `/api/get-user-by-userID`,
    data: { userID },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch user profile');
  }

  return response.data;
};
