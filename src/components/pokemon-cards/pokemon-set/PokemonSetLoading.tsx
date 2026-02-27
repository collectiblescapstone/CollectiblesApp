import { Box, Spinner } from '@chakra-ui/react'

/**
 * 
 * @returns 
 */
const PokemonSetLoading = () => {
    return (
        <Box textAlign="center" mt={10}>
            <Spinner size="xl" />
        </Box>
    )
}

export default PokemonSetLoading;