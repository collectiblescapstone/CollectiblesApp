import ForgetPasswordForm from '@/components/auth/ForgetPasswordForm';
import { Flex, Heading } from '@chakra-ui/react';

const ForgetPasswordPage = () => {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="inherit"
      minWidth="dvw"
    >
      <ForgetPasswordForm />
    </Flex>
  );
};

export default ForgetPasswordPage;
