'use client';

import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import Showcase from '@/components/edit-profile/Showcase';
import DeleteAccount from '@/components/edit-profile/DeleteAccount';
import { FormValues, VisibilityValues } from '@/types/personal-profile';
import { GeoLocation } from '@/types/geolocation';

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
  SimpleGrid,
  RadioCard,
  Fieldset,
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiEdit3, FiCheck, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthProvider';
import { pfp_image_mapping, visibilityOptions } from './constants';
import AvatarPopup from '@/components/ui/PopupUI';
import { CapacitorHttp } from '@capacitor/core';
import { baseUrl } from '@/utils/constants';
import { fetchUserProfile } from '@/utils/profiles/userIDProfilePuller';

const MAX_CHARACTERS = 110;

const PersonalProfileScreen: React.FC = () => {
  const router = useRouter();
  const { session, loading, signOut } = useAuth();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      bio: '',
      location: '',
      longitude: undefined as unknown as number,
      latitude: undefined as unknown as number,
      instagram: '',
      x: '',
      facebook: '',
      whatsapp: '',
      discord: '',
      profilePic: 0,
      visibility: VisibilityValues.Public,
    },
  });

  const [showLocationSuggestions, setShowLocationSuggestions] = useState('');
  const [predictions, setPredictions] = useState<GeoLocation[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeoLocation | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleSelect = (place: GeoLocation) => {
    setSelectedPlace(place);
    setShowLocationSuggestions(place.formatted);
    setPredictions([]);
    setValue('location', place.formatted, { shouldValidate: true });
    setValue('latitude', place.lat, { shouldValidate: true });
    setValue('longitude', place.lon, { shouldValidate: true });
  };

  const handleInputChange = (value: string) => {
    setShowLocationSuggestions(value);
    setValue('location', value, { shouldValidate: true });
    if (selectedPlace && value !== selectedPlace.formatted) {
      setSelectedPlace(null);
      setValue('latitude', undefined as unknown as number, {
        shouldValidate: false,
      });
      setValue('longitude', undefined as unknown as number, {
        shouldValidate: false,
      });
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const bioVal = watch('bio');
  const profilePicVal = watch('profilePic');

  const handleSave = handleSubmit(async (data) => {
    if (!session?.user?.id) return;
    setIsSaving(true);
    try {
      const res = await CapacitorHttp.patch({
        url: `${baseUrl}/api/edit-profile`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ id: session?.user?.id, ...data }),
      });

      if (res.status !== 200) {
        const err = res.data.error;
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
    if (!session?.user?.id) return;
    async function fetchProfile() {
      try {
        const data = await fetchUserProfile(session?.user.id ?? '');
        reset({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          username: data.username ?? '',
          email: data.email ?? '',
          bio: data.bio ?? '',
          location: data.location ?? '',
          latitude: data.latitude ?? (undefined as unknown as number),
          longitude: data.longitude ?? (undefined as unknown as number),
          instagram: data.instagram ?? '',
          x: data.x ?? '',
          facebook: data.facebook ?? '',
          whatsapp: data.whatsapp ?? '',
          discord: data.discord ?? '',
          profilePic: data.profile_pic ?? 0,
          visibility: data.visibility ?? VisibilityValues.Public,
        });
        if (data.latitude != null && data.longitude != null) {
          setShowLocationSuggestions(data.location ?? '');
          setSelectedPlace({
            formatted: data.location ?? '',
            lat: data.latitude,
            lon: data.longitude,
          });
        }
      } catch (err) {
        console.error('Error loading profile', err);
      }
    }

    fetchProfile();
  }, [session?.user?.id, reset, setValue]);

  const wishlist = () => {
    router.push('/personal-profile/edit-profile/wishlist');
  };

  // Fetching location predictions from API route
  useEffect(() => {
    if (!showLocationSuggestions || showLocationSuggestions.length < 3) {
      setPredictions([]);
      return;
    }

    const timeout = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const url = `/api/get-location-predictions?query=${encodeURIComponent(
        showLocationSuggestions
      )}`;
      console.log('Fetching from:', url);

      fetch(url, { signal: abortController.signal })
        .then((res) => {
          console.log('Response status:', res.status);
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`API error: ${res.status} - ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log('API response data:', data);
          setPredictions(data.predictions || []);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Location prediction error:', err);
            setPredictions([]);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [showLocationSuggestions]);

  const AvatarPicker = () => {
    return (
      <Fieldset.Root invalid={!!errors.profilePic}>
        <Controller
          name="profilePic"
          control={control}
          render={({ field }) => (
            <RadioCard.Root
              value={field.value.toString()}
              onValueChange={({ value }) => field.onChange(Number(value))}
              name={field.name}
            >
              <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                {Object.entries(pfp_image_mapping).map(([key, src]) => (
                  <RadioCard.Item key={key} value={key}>
                    <RadioCard.ItemHiddenInput />
                    <RadioCard.ItemControl>
                      <RadioCard.ItemIndicator />
                      <RadioCard.ItemContent>
                        <Avatar.Root boxSize="100px" shape="rounded">
                          <Avatar.Image src={src} />
                        </Avatar.Root>
                      </RadioCard.ItemContent>
                    </RadioCard.ItemControl>
                  </RadioCard.Item>
                ))}
              </SimpleGrid>
            </RadioCard.Root>
          )}
        />
      </Fieldset.Root>
    );
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
        <Button
          position="relative"
          boxSize="100px"
          mt={-9}
          borderRadius="lg"
          overflow="hidden"
          onClick={() =>
            AvatarPopup.open('avatar', {
              title: 'Pick an Avatar',
              content: <AvatarPicker />,
              onClickClose: () => AvatarPopup.close('avatar'),
            })
          }
        >
          <Avatar.Root boxSize="100px" shape="rounded">
            <Avatar.Image src={pfp_image_mapping[profilePicVal]} />
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
        </Button>
        <AvatarPopup.Viewport />
        <Field.Root required invalid={!!errors.firstName}>
          <Field.Label>
            First Name <Field.RequiredIndicator />
          </Field.Label>
          <Input
            placeholder="Enter your first name"
            fontWeight="normal"
            {...register('firstName', { required: 'First name is required' })}
          />
          <Field.HelperText>
            Your first name displayed on your profile.
          </Field.HelperText>
          {errors.firstName && (
            <Field.ErrorText>{errors.firstName.message}</Field.ErrorText>
          )}
        </Field.Root>
        <Field.Root required invalid={!!errors.lastName}>
          <Field.Label>
            Last Name <Field.RequiredIndicator />
          </Field.Label>
          <Input
            placeholder="Enter your last name"
            fontWeight="normal"
            {...register('lastName', { required: 'Last name is required' })}
          />
          <Field.HelperText>
            Your last name displayed on your profile.
          </Field.HelperText>
          {errors.lastName && (
            <Field.ErrorText>{errors.lastName.message}</Field.ErrorText>
          )}
        </Field.Root>
        <Field.Root required invalid={!!errors.username}>
          <Field.Label>
            Username <Field.RequiredIndicator />
          </Field.Label>
          <Input
            placeholder="Enter your username"
            fontWeight="normal"
            {...register('username', { required: 'Username is required' })}
          />
          <Field.HelperText>
            Your username must be unique and contain only letters, numbers, and
            underscores.
          </Field.HelperText>
          {errors.username && (
            <Field.ErrorText>{errors.username.message}</Field.ErrorText>
          )}
        </Field.Root>
        <Field.Root disabled>
          <Field.Label>
            Email <Field.RequiredIndicator />
          </Field.Label>
          <Input
            disabled
            placeholder="your email"
            fontWeight="normal"
            {...register('email')}
          />
          <Field.HelperText>Your email cannot be changed.</Field.HelperText>
          {errors.email && (
            <Field.ErrorText>{errors.email.message}</Field.ErrorText>
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
        <Field.Root
          required
          invalid={!!errors.location || !!errors.longitude}
          position="relative"
        >
          <Field.Label>
            Location <Field.RequiredIndicator />
          </Field.Label>
          <Controller
            name="location"
            control={control}
            rules={{ required: 'Location is required' }}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="ex. Toronto, ON"
                fontWeight="normal"
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  handleInputChange(e.target.value);
                }}
              />
            )}
          />
          <Controller
            name="longitude" // Only using controller for longitude to validate that a place was selected from the dropdown, not just typed in
            control={control}
            rules={{
              validate: () =>
                selectedPlace
                  ? true
                  : 'Please select a valid location from the provided suggestions',
            }}
            render={({ field }) => <input type="hidden" {...field} />}
          />
          {predictions.length > 0 && !selectedPlace && (
            <Box
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              maxH="200px"
              overflowY="auto"
              bg="white"
              zIndex={20}
              position="relative"
              w="full"
            >
              {predictions.map((place, index) => (
                <Box
                  key={`${place.lat}-${place.lon}-${index}`}
                  p={2}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => {
                    handleSelect(place);
                  }}
                >
                  {place.formatted}
                </Box>
              ))}
            </Box>
          )}
          <Field.HelperText>
            Will be displayed on your profile.
          </Field.HelperText>
          {(errors.location || errors.longitude) && (
            <Field.ErrorText>
              {errors.location?.message || errors.longitude?.message}
            </Field.ErrorText>
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
          <Field.Label>Twitter/X</Field.Label>
          <InputGroup startAddon={<Span color="gray.800">@</Span>}>
            <Input
              placeholder="Twitter/X handle"
              fontWeight="normal"
              {...register('x')}
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
        <Field.Root>
          <Field.Label>WhatsApp</Field.Label>
          <InputGroup startAddon={<Span color="gray.800">#</Span>}>
            <Input
              placeholder="WhatsApp nummber"
              fontWeight="normal"
              {...register('whatsapp')}
            />
          </InputGroup>
        </Field.Root>
        <Field.Root>
          <Field.Label>Discord</Field.Label>
          <InputGroup startAddon={<Span color="gray.800">@</Span>}>
            <Input
              placeholder="Discord handle"
              fontWeight="normal"
              {...register('discord')}
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
              {visibilityOptions.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Field.HelperText>The visibility of your profile.</Field.HelperText>
        </Field.Root>
      </Flex>
      <Flex justifyContent="center" alignItems="center" w="100%" mt={7}>
        <Button
          variant="solid"
          colorScheme="black"
          size="xl"
          onClick={() => signOut()}
        >
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
