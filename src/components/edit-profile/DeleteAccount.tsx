'use client'

import React, { useState } from 'react'
import { Button, Field, Input, Text, VStack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthProvider'
import PopupUI from '@/components/ui/PopupUI'

interface FormValues {
    confirmationText: string
}

const DeleteAccount: React.FC = () => {
    const openDeletePopup = () => {
        PopupUI.open('delete-account', {
            title: '⚠️ Delete Account?',
            content: <DeleteAccountForm />,
            onClickClose: () => PopupUI.close('delete-account')
        })
    }

    return (
        <>
            <Button
                variant="solid"
                colorPalette="red"
                size="lg"
                onClick={openDeletePopup}
            >
                Delete my account
            </Button>
            <PopupUI.Viewport />
        </>
    )
}

const DeleteAccountForm: React.FC = () => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { deleteAccount } = useAuth()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<FormValues>()

    const confirmDelete = async (data: FormValues) => {
        // Check if user typed exactly "delete_account"
        if (data.confirmationText !== 'delete_account') {
            setError('confirmationText', {
                type: 'manual',
                message: 'You must type "delete_account" exactly to confirm'
            })
            return
        }

        setIsDeleting(true)
        setErrorMessage(null)

        // Call the deleteAccount function from AuthProvider
        const result = await deleteAccount()

        if (!result.success) {
            setErrorMessage(
                result.error || 'Failed to delete account. Please try again.'
            )
            setIsDeleting(false)
        }
        // If successful, user will be signed out and redirected automatically
    }

    return (
        <VStack gap={4} width="100%">
            <Text fontSize="md" textAlign="center">
                This action cannot be undone. All your data including your
                collection, wishlist, and profile information will be
                permanently deleted.
            </Text>
            <Text fontSize="md" fontWeight="bold" textAlign="center">
                To confirm, please type{' '}
                <Text as="span" color="red.500" fontFamily="monospace">
                    delete_account
                </Text>{' '}
                below:
            </Text>
            <Field.Root invalid={!!errors.confirmationText} width="100%">
                <Input
                    {...register('confirmationText', {
                        required: 'This field is required'
                    })}
                    placeholder="Type delete_account here"
                    disabled={isDeleting}
                    variant="subtle"
                    size="lg"
                />
                <Field.ErrorText>
                    {errors.confirmationText?.message}
                </Field.ErrorText>
            </Field.Root>
            {errorMessage && (
                <Text color="red.500" fontSize="sm" textAlign="center">
                    {errorMessage}
                </Text>
            )}
            <Button
                variant="solid"
                colorPalette="red"
                size="lg"
                width="100%"
                onClick={handleSubmit(confirmDelete)}
                loading={isDeleting}
                disabled={isDeleting}
            >
                {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
            </Button>
        </VStack>
    )
}

export default DeleteAccount
