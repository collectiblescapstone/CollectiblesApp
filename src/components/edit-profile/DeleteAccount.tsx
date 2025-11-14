'use client';

import React, { useEffect } from 'react';
import { useState } from 'react';

import { Button, Box, Flex, Text, Field } from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { FiXCircle } from 'react-icons/fi';

interface FormValues {
  password: string;
}

const DeleteAccount: React.FC = () => {
  const [DeletePopUpOpen, setDeletePopUpOpen] = useState(false);

  const PASSWORD = 'ishpreet';

  const deletepressed = () => {
    setDeletePopUpOpen(true);
  };

  const closePopup = () => {
    setDeletePopUpOpen(false);
    // reset password field if needed
    reset({ password: '' });
  };

  useEffect(() => {
    if (DeletePopUpOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [DeletePopUpOpen]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const confirmDelete = (data: FormValues) => {
    if (data.password !== PASSWORD) {
      setError('password', { type: 'manual', message: 'Incorrect password' });
      return;
    }
    // Proceed with account deletion logic here
    closePopup();
  };

  return (
    <>
      <Button
        variant="solid"
        colorPalette="red"
        size="lg"
        onClick={deletepressed}
      >
        Delete my account
      </Button>
      {DeletePopUpOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="blackAlpha.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
        >
          <Box
            bg="white"
            shadow={'md'}
            borderRadius="lg"
            alignItems={'center'}
            justifyContent={'center'}
            textAlign={'center'}
            p={7}
            width={'85vw'}
            height={'auto'}
            outlineColor={'red'}
            outlineWidth={2}
            outlineStyle={'solid'}
          >
            <Flex flexDirection="column" alignItems="center" gap={5}>
              <Button
                position="relative"
                alignSelf="flex-end"
                variant="ghost"
                mt={-7}
                mb={-14}
                left={8}
                size="2xl"
              >
                <FiXCircle color="black" onClick={closePopup} />
              </Button>
              <Text fontSize="xl" fontWeight="bold" color={'red'}>
                Are you sure?
              </Text>
              <Text fontSize={'md'} fontWeight={'normal'}>
                You are about to permanently delete your account. If you are
                sure you would like to proceed, please enter your account
                password.
              </Text>
              <Field.Root invalid={!!errors.password} width="100%">
                <PasswordInput
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>
              <Button
                variant="solid"
                colorPalette="red"
                size="lg"
                onClick={handleSubmit(confirmDelete)}
              >
                Delete my account
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  );
};

export default DeleteAccount;
