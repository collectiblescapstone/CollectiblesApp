'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderProvider';

import { UserProfile } from '@/types/personal-profile';
import { fetchUserProfile } from '@/utils/profiles/userIDProfilePuller';

import { Box, Flex, Text, Button, Spinner } from '@chakra-ui/react';

import { FiEdit3 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthProvider';
import ProfileLayout from '@/components/profiles/ProfileLayout';
import StarRating from '@/components/profiles/StarRating';

const PersonalProfileScreen: React.FC = () => {
  const router = useRouter();
  const { setProfileID } = useHeader();
  const { session } = useAuth();

  const userID = session?.user.id;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const editpress = () => {
    router.push('/personal-profile/edit-profile');
  };

  useEffect(() => {
    if (!userID) {
      setError('No user ID found');
      setLoading(false);
      return;
    }
    const loadUserProfile = async () => {
      try {
        const data = await fetchUserProfile(userID);
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
  }, [userID, setProfileID]);

  if (loading || !session) {
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

  const leftButtonInteractible = (
    <Button
      onClick={editpress}
      position="relative"
      size="lg"
      rounded="sm"
      variant="solid"
      bg="white"
      color="black"
    >
      <FiEdit3 />
    </Button>
  );

  const rightButtonInteractible = (
    <Box mr={2} mt={2}>
      <StarRating rating={user.rating} ratingCount={user.rating_count} />
    </Box>
  );

  return (
    <ProfileLayout
      user={user}
      leftInteractible={leftButtonInteractible}
      rightInteractible={rightButtonInteractible}
    />
  );
};

export default PersonalProfileScreen;
