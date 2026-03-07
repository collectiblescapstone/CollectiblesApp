import { Box } from '@chakra-ui/react'
import React from 'react'

interface CombinedIconsProps {
    icons: React.ReactNode[]
}

const CombinedIcons = ({ icons }: CombinedIconsProps) => {
    return (
        <Box
            position="relative"
            boxSize="1em"
            display="inline-block"
            aria-hidden="true"
        >
            {icons.map((icon, index) => (
                <Box key={index} position="absolute" top="0" left="0">
                    {icon}
                </Box>
            ))}
        </Box>
    )
}

export default CombinedIcons
