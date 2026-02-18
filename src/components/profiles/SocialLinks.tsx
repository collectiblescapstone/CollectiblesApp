'use client'

import React from 'react'

import { Flex, Icon, Text } from '@chakra-ui/react'
import { FaInstagram, FaFacebook, FaDiscord, FaWhatsapp } from 'react-icons/fa'
import { RiTwitterXLine } from 'react-icons/ri'
import { SocialsType } from '@/types/user-profile'

interface SocialLinksProps {
    instagram?: string
    x?: string
    facebook?: string
    discord?: string
    whatsapp?: string
}

const SocialLinks = ({
    instagram,
    x,
    facebook,
    discord,
    whatsapp
}: SocialLinksProps) => {
    const socials: SocialsType[] = [
        instagram && { icon: FaInstagram, handle: instagram },
        x && { icon: RiTwitterXLine, handle: x },
        facebook && { icon: FaFacebook, handle: facebook },
        discord && { icon: FaDiscord, handle: discord },
        whatsapp && { icon: FaWhatsapp, handle: whatsapp }
    ].filter(Boolean) as SocialsType[]

    if (socials.length === 0) {
        return null
    }

    return (
        <Flex
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            gap={3}
            wrap={'wrap'}
        >
            {socials.map((social, index) => (
                <Flex
                    key={index}
                    flexDirection="row"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                >
                    <Icon as={social.icon} boxSize={4} />
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                        {social.handle}
                    </Text>
                </Flex>
            ))}
        </Flex>
    )
}

export default SocialLinks
