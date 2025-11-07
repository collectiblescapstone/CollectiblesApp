'use client';

import React from 'react';
import { useState } from "react";
import { useRouter } from 'next/navigation';

import Showcase from '@/components/edit-profile/showcase';
import DeleteAccount from '@/components/edit-profile/deleteaccount';

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
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { FiEdit3, FiCheck, FiEdit2 } from 'react-icons/fi';

const MAX_CHARACTERS = 110;

const PersonalProfileScreen: React.FC = () => {
    
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        bio: "",
        location: "",
        instagram: "",
        twitter: "",
        facebook: "",
        visibility: "Public",
    });

    const [error, setError] = useState("");

    const handleChange = (key: string, value: string) => {
        setForm({
            ...form,
            [key]: value,
        });
    }

    const handleSave = (e: React.FormEvent) => {
        const allValid = form.name.trim() 
                         && form.location.trim();
        e.preventDefault();
        
        if (!allValid) {
            setError("This field is required.");
            return;
        }

        // Save logic here
    };

    const wishlist = () => {
        router.push('/personal-profile/edit-profile/wishlist');
    }

    const signout = () => {
        // Sign out logic here
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
            mt={16}
            bgColor="blackAlpha.600"
            backgroundBlendMode="darken"
        />
        <Flex
            position="absolute"
            top={3}
            right={3}
        >
            <FiEdit3 size={24} color='white'/>
        </Flex>
        <Flex
            position="absolute"
            top={32}
            right={9}
        >
            <Button variant="solid" colorPalette="black" size="md" onClick={handleSave}>
                <FiCheck /> Save
            </Button>
        </Flex>
        <Flex
            flexDirection="column"
            alignItems="flex-start"
            gap={5}
            px={5}
        >
            <Box 
                position="relative" 
                boxSize="100px" 
                mt={-9} 
                borderRadius="lg" 
                overflow="hidden"
            >
                <Avatar.Root boxSize="100%" shape="rounded">
                    <Avatar.Image src="/user-profile/pfp_temp.jpg" />
                    <Avatar.Fallback>SA</Avatar.Fallback>
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
                    <FiEdit3 size={24} color='white'/>
                </Flex>
            </Box>
            <Field.Root required invalid={!!error}>
                <Field.Label>
                    Name <Field.RequiredIndicator />
                </Field.Label>
                <Input 
                    placeholder="Enter your name" 
                    fontWeight="normal"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
                <Field.HelperText>The name displayed on your profile.</Field.HelperText>
                {error && <Field.ErrorText>{error}</Field.ErrorText>}
            </Field.Root>
            <Field.Root>
                <Field.Label>
                    Bio
                </Field.Label>
                <Span color="gray.500" textStyle="xs">
                    {form.bio.length} / {MAX_CHARACTERS}
                </Span>
                <InputGroup>
                    <Input 
                        placeholder="Hi! This is my amazing bio!"
                        fontWeight="normal"
                        value={form.bio}
                        maxLength={MAX_CHARACTERS}
                        onChange={(e) => handleChange('bio', e.currentTarget.value.slice(0, MAX_CHARACTERS))}
                    />
                </InputGroup>
                <Field.HelperText>Write a little about yourself for others to see.</Field.HelperText>
            </Field.Root>
            <Field.Root required invalid={!!error}>
                <Field.Label>
                    Location <Field.RequiredIndicator />
                </Field.Label>
                <Input 
                    placeholder="ex. Toronto, ON" 
                    fontWeight="normal"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                />
                <Field.HelperText>Will be displayed on your profile.</Field.HelperText>
                {error && <Field.ErrorText>{error}</Field.ErrorText>}
            </Field.Root>
            <Field.Root>
                <Field.Label>
                    Instagram
                </Field.Label>
                <InputGroup
                    startAddon={<Span color="gray.800">@</Span>}
                >
                    <Input 
                        placeholder="Instagram handle" 
                        fontWeight="normal"
                        value={form.instagram}
                        onChange={(e) => handleChange('instagram', e.target.value)}
                    />
                </InputGroup>
            </Field.Root>
            <Field.Root>
                <Field.Label>
                    Twitter
                </Field.Label>
                <InputGroup
                    startAddon={<Span color="gray.800">@</Span>}
                >
                    <Input 
                        placeholder="Twitter handle" 
                        fontWeight="normal"
                        value={form.twitter}
                        onChange={(e) => handleChange('twitter', e.target.value)}
                    />
                </InputGroup>
            </Field.Root>
            <Field.Root>
                <Field.Label>
                    Facebook
                </Field.Label>
                <InputGroup
                    startAddon={<Span color="gray.800">@</Span>}
                >
                    <Input 
                        placeholder="Facebook handle" 
                        fontWeight="normal"
                        value={form.facebook}
                        onChange={(e) => handleChange('facebook', e.target.value)}
                    />
                </InputGroup>
            </Field.Root>
            <Showcase />
            <Text fontSize="sm" color="gray.700" fontWeight="semibold" mb={2}>
                Wish List
            </Text>
            <Button variant="solid" colorPalette="black" size="md" onClick={wishlist} mt={-4}>
                <FiEdit2 /> Edit
            </Button>
            <Field.Root>
                <Field.Label>Public Visibility</Field.Label>
                <NativeSelect.Root>
                    <NativeSelect.Field 
                        name="Profile Visibility"
                        value={form.visibility}
                        onChange={(e) => handleChange('visibility', e.target.value)}
                    >
                    {["Public", "Friends Only", "Private"].map((item) => (
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
        <Flex
            justifyContent="center"
            alignItems="center"
            w="100%"
            mt={7}
        >
            <Button variant="solid" colorScheme="black" size="xl" onClick={signout}>
                Sign out
            </Button>
        </Flex>
        <Flex
            justifyContent="center"
            alignItems="center"
            w="100%"
            mt={3}
            mb={7}
        >
            <Box height="3px" width="91%" bg="gray.500" mt={5}/>
        </Flex>
        <Flex
            flexDirection="column"
            alignItems="flex-start"
            gap={2}
            px={5}
        >
            <Text fontSize="md" color="red.500" fontWeight="bold" mb={2}>
                Account Deletion
            </Text>
            <Text fontSize="md" color="black" fontWeight="normal" mb={2}>
                This is irreversible. Once you delete your account, your account will be permanently 
                removed from the online space. All items in your collection will also be permanently deleted. 
            </Text>
        </Flex>
        <Flex
            justifyContent="center"
            alignItems="center"
            w="100%"
            py={5}
        >
            <DeleteAccount />
        </Flex>
    </Box>
  );
};

export default PersonalProfileScreen;