import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { Flex } from '@chakra-ui/react'

const ResetPasswordPage = () => {
    return (
        <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="inherit"
            minWidth="dvw"
        >
            <ResetPasswordForm />
        </Flex>
    )
}

export default ResetPasswordPage
