import { UserProfile } from '@/types/personal-profile';

export const fetchUserProfile = async (
  userName: string
): Promise<UserProfile> => {
  const response = await fetch(
    `/api/get-user-by-username?userName=${userName}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};
