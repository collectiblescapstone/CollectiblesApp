'use client';

import React, { useEffect, useState } from 'react';
import { useHeader } from '@/context/HeaderProvider';

import { UserProfile } from '@/types/personal-profile';

import { Box, Flex, Text, Spinner } from '@chakra-ui/react';
import { fetchUserProfile } from '@/utils/profiles/userNameProfilePuller';
import ProfileLayout from '@/components/profiles/ProfileLayout';
import AccountOptions from '@/components/profiles/AccountOptions';
import StarRating from '@/components/profiles/StarRating';

const ProfileScreen = () => {
  const { setProfileID } = useHeader();

  // This is a temporary username for testing purposes.
  // Change the specific username to match the profile you have in your local database.
  const userName = 'kennethkvs';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userName) {
      setError('No user name found');
      setLoading(false);
      return;
    }
    const loadUserProfile = async () => {
      try {
        const data = await fetchUserProfile(userName);
        setUser(data);
        if (setProfileID) {
          setProfileID(data.username);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userName, setProfileID]);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh">
        <Text>{error}</Text>
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex justifyContent="center" alignItems="center" height="50vh">
        <Text>User not found</Text>
      </Flex>
    );
  }

  const rightButtonInteractible = (
    <Box mr={2} mt={2}>
      <StarRating rating={user.rating} ratingCount={user.rating_count} />
    </Box>
  );

  return (
    <ProfileLayout
      user={user}
      leftInteractible={<AccountOptions />}
      rightInteractible={rightButtonInteractible}
    />
  );
};

export default ProfileScreen;
