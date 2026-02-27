import { Box, Spinner } from '@chakra-ui/react'

/**
 * 
 * @returns 
 */
const PokemonPolaroidLoading = () => {
    return (
        <Box
            as="button"
            bg="white"
            boxShadow="lg"
            borderRadius="md"
            w={{ base: '45vw', md: '200px' }}
            p={3}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.05)', boxShadow: 'xl' }}
            _active={{ transform: 'scale(0.98)' }}
        >
            <Spinner size="xl" />
        </Box>
    )
}

export default PokemonPolaroidLoading