import { UserProfile } from '@/types/personal-profile';

export const fetchUserProfile = async (
  userID: string
): Promise<UserProfile> => {
  const response = await fetch(
    `/api/get-user-by-userID?userID=${encodeURIComponent(userID)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};
