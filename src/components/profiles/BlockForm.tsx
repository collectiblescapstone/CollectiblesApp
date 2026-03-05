import { useAuth } from '@/context/AuthProvider'
import { useProfileSelected } from '@/context/ProfileSelectionProvider'
import { baseUrl } from '@/utils/constants'
import { CapacitorHttp } from '@capacitor/core'
import { Box, Button, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface BlockFormProps {
    onCancel: () => void
    userId: string
}

const BlockForm = ({ onCancel, userId }: BlockFormProps) => {
    const { push } = useRouter()
    const { setProfileSelected } = useProfileSelected()
    const { session } = useAuth()

    const [error, setError] = useState<string | null>(null)

    const handleBlockUser = async () => {
        const res = await CapacitorHttp.post({
            url: `${baseUrl}/api/block-user`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`
            },
            data: {
                userId: session?.user.id,
                blockedUserId: userId
            }
        })

        if (res.status !== 200) {
            setError(res.data?.error || 'Unknown error')
            return
        }
        onCancel() // Close the popup after blocking the user
        setProfileSelected('') // Clear the selected profile after blocking
        push('/trade')
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Text fontSize="lg">Are you sure you want to block this user?</Text>
            {error && (
                <Text color="red.500" mt={2}>
                    {error}
                </Text>
            )}
            <Box>
                <Button mt={4} bgColor="red" onClick={handleBlockUser}>
                    Block User
                </Button>
                <Button mt={4} ml={2} onClick={onCancel}>
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}

export default BlockForm
