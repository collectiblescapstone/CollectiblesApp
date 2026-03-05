import { useProfileSelected } from '@/context/ProfileSelectionProvider'
import { Box, Button, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

interface BlockFormProps {
    onCancel: () => void
}

const BlockForm = ({ onCancel }: BlockFormProps) => {
    const { push } = useRouter()
    const { setProfileSelected } = useProfileSelected()

    const handleBlockUser = () => {
        // Implement block user logic here
        onCancel() // Close the popup after blocking the user
        setProfileSelected('') // Clear the selected profile after blocking
        push('/trade')
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <Text fontSize="lg">Are you sure you want to block this user?</Text>
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
