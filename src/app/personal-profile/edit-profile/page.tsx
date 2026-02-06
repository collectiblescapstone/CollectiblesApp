'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import Showcase from '@/components/edit-profile/Showcase';
import DeleteAccount from '@/components/edit-profile/DeleteAccount';
import { FormValues } from '@/types/personal-profile';
import { supabase } from '@/utils/supabase';

import {
  Box,
  Flex,
  Field,
  Input,
  Button,
  Span,
  InputGroup,
  Text,
  NativeSelect,
  Spinner,
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiEdit3, FiCheck, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthProvider';

const MAX_CHARACTERS = 110;

const PersonalProfileScreen: React.FC = () => {
  const router = useRouter();
  const { session, loading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      bio: '',
      location: '',
      instagram: '',
      twitter: '',
      facebook: '',
      visibility: 'Public',
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const bioVal = watch('bio');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleSave = handleSubmit(async (data) => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...data }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
      } else {
        router.push('/personal-profile');
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsSaving(false);
    }
  });

  // Fetch existing profile data
  useEffect(() => {
    if (!userId) return;
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile?id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          reset({
            name: data.name ?? '',
            bio: data.bio ?? '',
            location: data.location ?? '',
            instagram: data.instagram ?? '',
            twitter: data.twitter ?? '',
            facebook: data.facebook ?? '',
            visibility: data.visibility ?? 'Public',
          });
        }
      } catch (err) {
        console.error('Error loading profile', err);
      }
    }

    fetchProfile();
  }, [userId, reset]);

  const wishlist = () => {
    router.push('/personal-profile/edit-profile/wishlist');
  };

  const signout = () => {
    // Sign out logic here
  };

  if (loading || !session) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box bg="white" minH="100vh" color="black">
      <Box
        bgImage="url('/user-profile/banner_temp.jpg')"
        bgSize="cover"
        bgPos="center"
        width="100%"
        height="110px"
        position="relative"
        bgColor="blackAlpha.600"
        backgroundBlendMode="darken"
      />
      <Flex position="relative" top={5} right={7} justifyContent="flex-end">
        <Button
          variant="solid"
          colorPalette="black"
          size="md"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FiCheck /> {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Flex>
      <Flex flexDirection="column" alignItems="flex-start" gap={5} px={5}>
        <Box
          position="relative"
          boxSize="100px"
          mt={-9}
          borderRadius="lg"
          overflow="hidden"
        >
          <Avatar.Root boxSize="100%" shape="rounded">
            <Avatar.Image src="/user-profile/pfp_temp.jpg" />
            <Avatar.Fallback> SA </Avatar.Fallback>
          </Avatar.Root>
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            bg="black"
            opacity={0.5}
          />
          <Flex
            position="absolute"
            justifyContent="center"
            alignItems="center"
            top={0}
            left={0}
            w="100%"
            h="100%"
          >
            <FiEdit3 size={24} color="white" />
          </Flex>
        </Box>
        <Field.Root required invalid={!!errors.name}>
          <Field.Label>
            Name <Field.RequiredIndicator />
          </Field.Label>
          <Input
            placeholder="Enter your name"
            fontWeight="normal"
            {...register('name', { required: 'Name is required' })}
          />
          <Field.HelperText>
            The name displayed on your profile.
          </Field.HelperText>
          {errors.name && (
            <Field.ErrorText>{errors.name.message}</Field.ErrorText>
          )}
        </Field.Root>
        <Field.Root>
          <Field.Label>Bio</Field.Label>
          <Span color="gray.500" textStyle="xs">
            {bioVal.length} / {MAX_CHARACTERS}
          </Span>
          <InputGroup>
            <Input
              placeholder="Hi! This is my amazing bio!"
              fontWeight="normal"
              maxLength={MAX_CHARACTERS}
              {...register('bio')}
            />
          </InputGroup>
          <Field.HelperText>
            Write a little about yourself for others to see.
          </Field.HelperText>
        </Field.Root>
        <Field.Root required invalid={!!errors.location}>
          <Field.Label>
            Location <Field.RequiredIndicator />
          </Field.Label>
          <Input
            placeholder="ex. Toronto, ON"
            fontWeight="normal"
            {...register('location', { required: 'Location is required' })}
          />
          <Field.HelperText>
            Will be displayed on your profile.
          </Field.HelperText>
          {errors.location && (
            <Field.ErrorText>{errors.location.message}</Field.ErrorText>
          )}
        </Field.Root>
        <Field.Root>
          <Field.Label>Instagram</Field.Label>
          <InputGroup startAddon={<Span color="gray.800">@</Span>}>
            <Input
              placeholder="Instagram handle"
              fontWeight="normal"
              {...register('instagram')}
            />
          </InputGroup>
        </Field.Root>
        <Field.Root>
          <Field.Label>Twitter</Field.Label>
          <InputGroup startAddon={<Span color="gray.800">@</Span>}>
            <Input
              placeholder="Twitter handle"
              fontWeight="normal"
              {...register('twitter')}
            />
          </InputGroup>
        </Field.Root>
        <Field.Root>
          <Field.Label>Facebook</Field.Label>
          <InputGroup startAddon={<Span color="gray.800">@</Span>}>
            <Input
              placeholder="Facebook handle"
              fontWeight="normal"
              {...register('facebook')}
            />
          </InputGroup>
        </Field.Root>
        <Showcase />
        <Text fontSize="sm" color="gray.700" fontWeight="semibold" mb={2}>
          Wish List
        </Text>
        <Button
          variant="solid"
          colorPalette="black"
          size="md"
          onClick={wishlist}
          mt={-4}
        >
          <FiEdit2 /> Edit
        </Button>
        <Field.Root>
          <Field.Label>Public Visibility</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field {...register('visibility')}>
              {['Public', 'Friends Only', 'Private'].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Field.HelperText>The visibility of your profile.</Field.HelperText>
        </Field.Root>
      </Flex>
      <Flex justifyContent="center" alignItems="center" w="100%" mt={7}>
        <Button variant="solid" colorScheme="black" size="xl" onClick={signout}>
          Sign out
        </Button>
      </Flex>
      <Flex justifyContent="center" alignItems="center" w="100%" mt={3} mb={7}>
        <Box height="3px" width="91%" bg="gray.500" mt={5} />
      </Flex>
      <Flex flexDirection="column" alignItems="flex-start" gap={2} px={5}>
        <Text fontSize="md" color="red.500" fontWeight="bold" mb={2}>
          Account Deletion
        </Text>
        <Text fontSize="md" color="black" fontWeight="normal" mb={2}>
          This is irreversible. Once you delete your account, your account will
          be permanently removed from the online space. All items in your
          collection will also be permanently deleted.
        </Text>
      </Flex>
      <Flex justifyContent="center" alignItems="center" w="100%" py={5}>
        <DeleteAccount />
      </Flex>
    </Box>
  );
};

export default PersonalProfileScreen;
