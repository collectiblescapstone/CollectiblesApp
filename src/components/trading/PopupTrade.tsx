'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
    Avatar,
    Card,
    HStack,
    VStack,
    Text,
    IconButton,
    Flex
} from '@chakra-ui/react'
import TradingCards from '@/components/trading/TradingCards'
import { LuArrowRightLeft } from 'react-icons/lu'
import { FaInstagram, FaFacebook, FaDiscord, FaWhatsapp } from 'react-icons/fa'
import { RiTwitterXLine } from 'react-icons/ri'

type ContactMethod = {
    method: string
    value: string
}

type TradeCardPopupProps = {
    username: string
    contacts?: ContactMethod[]
    avatarUrl?: string
    user1Wishlist?: { name: string; image_url: string }[]
    user2Wishlist?: { name: string; image_url: string }[]
}

const TradeCardPopup: React.FC<TradeCardPopupProps> = (props) => {
    const { username, contacts, avatarUrl, user1Wishlist, user2Wishlist } =
        props

    // Debug log to see what contacts are being passed
    console.log('PopupTrade contacts:', contacts)

    // helper to normalise contact method names and check existence
    const normalize = (s?: string) =>
        (s ?? '').toLowerCase().replace(/\s+/g, '')
    const hasContact = (names: string[]) =>
        !!contacts?.some((c) => names.includes(normalize(c.method)))
    const getContactValue = (names: string[]) =>
        contacts?.find((c) => names.includes(normalize(c.method)))?.value

    // state to show small inline confirmation when something is copied
    const [copied, setCopied] = useState<string | null>(null)
    // store timeout id so we can clear previous timeout to avoid race conditions
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // copy the contact value (build profile URL for social methods) to the clipboard quietly (no toast)
    const copyToClipboard = async (types: string[]) => {
        const value = getContactValue(types)
        if (!value) return
        const v = value.trim()
        const primary = types[0]

        // build a sensible profile/link value per type
        let toCopy = v
        if (primary === 'instagram') {
            const handle = v.replace(/^@/, '')
            toCopy = v.startsWith('http')
                ? v
                : `https://instagram.com/${handle}`
        } else if (primary === 'x' || primary === 'twitter') {
            const handle = v.replace(/^@/, '')
            toCopy = v.startsWith('http') ? v : `https://x.com/${handle}`
        } else if (primary === 'facebook') {
            const handle = v.replace(/^@/, '')
            toCopy = v.startsWith('http') ? v : `https://facebook.com/${handle}`
        } else if (primary === 'whatsapp') {
            const digits = v.replace(/\D/g, '')
            toCopy = digits ? `https://wa.me/${digits}` : v
        } else if (primary === 'discord') {
            // Discord can't be reliably converted to a public profile URL from name
            // so copy the raw handle
            toCopy = v
        }

        try {
            await navigator.clipboard.writeText(toCopy)
            setCopied(primary)
            // clear any existing timeout so a previous click doesn't clear the new indicator
            if (timeoutRef.current) {
                clearTimeout(
                    timeoutRef.current as ReturnType<typeof setTimeout>
                )
            }
            timeoutRef.current = setTimeout(() => {
                setCopied(null)
                timeoutRef.current = null
            }, 1500)
        } catch (e) {
            // copy failed - log for debugging
            console.error('Copy to clipboard failed', e)
        }
    }

    // clear timeout on unmount to avoid leaking timers
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(
                    timeoutRef.current as ReturnType<typeof setTimeout>
                )
                timeoutRef.current = null
            }
        }
    }, [])

    return (
        <Card.Root width="100%">
            {/* add small vertical padding so there's space at top/bottom */}
            <Card.Body py={3}>
                {/*their cards*/}
                <VStack align="center" gap={2}>
                    <TradingCards
                        cards={user1Wishlist?.map((card) => ({
                            name: card.name,
                            image: card.image_url
                        }))}
                    />
                    <VStack align="center" gap="3">
                        <HStack>
                            <HStack gap="2" mt={1}>
                                <Avatar.Root boxSize="30px" shape="rounded">
                                    <Avatar.Image src={avatarUrl} />
                                </Avatar.Root>
                                <Text fontWeight="semibold" textStyle="sm">
                                    {username}
                                </Text>
                            </HStack>
                        </HStack>
                        <HStack>
                            {hasContact(['instagram']) && (
                                <HStack key="instagram">
                                    <IconButton
                                        aria-label="instagram"
                                        onClick={() =>
                                            copyToClipboard(['instagram'])
                                        }
                                    >
                                        <FaInstagram size={20} />
                                    </IconButton>
                                    {copied === 'instagram' && (
                                        <Text fontSize="xs" color="green.500">
                                            Copied
                                        </Text>
                                    )}
                                </HStack>
                            )}
                            {hasContact(['x', 'twitter']) && (
                                <HStack key="x">
                                    <IconButton
                                        aria-label="x"
                                        onClick={() =>
                                            copyToClipboard(['x', 'twitter'])
                                        }
                                    >
                                        <RiTwitterXLine size={20} />
                                    </IconButton>
                                    {copied === 'x' && (
                                        <Text fontSize="xs" color="green.500">
                                            Copied
                                        </Text>
                                    )}
                                </HStack>
                            )}
                            {hasContact(['facebook']) && (
                                <HStack key="facebook">
                                    <IconButton
                                        aria-label="facebook"
                                        onClick={() =>
                                            copyToClipboard(['facebook'])
                                        }
                                    >
                                        <FaFacebook size={20} />
                                    </IconButton>
                                    {copied === 'facebook' && (
                                        <Text fontSize="xs" color="green.500">
                                            Copied
                                        </Text>
                                    )}
                                </HStack>
                            )}
                            {hasContact(['whatsapp']) && (
                                <HStack key="whatsapp">
                                    <IconButton
                                        aria-label="whatsapp"
                                        onClick={() =>
                                            copyToClipboard(['whatsapp'])
                                        }
                                    >
                                        <FaWhatsapp size={20} />
                                    </IconButton>
                                    {copied === 'whatsapp' && (
                                        <Text fontSize="xs" color="green.500">
                                            Copied
                                        </Text>
                                    )}
                                </HStack>
                            )}
                            {hasContact(['discord']) && (
                                <HStack key="discord">
                                    <IconButton
                                        aria-label="discord"
                                        onClick={() =>
                                            copyToClipboard(['discord'])
                                        }
                                    >
                                        <FaDiscord size={20} />
                                    </IconButton>
                                    {copied === 'discord' && (
                                        <Text fontSize="xs" color="green.500">
                                            Copied
                                        </Text>
                                    )}
                                </HStack>
                            )}
                        </HStack>
                    </VStack>

                    <LuArrowRightLeft size={40} />

                    {/*/!*your cards*!/*/}
                    <Flex mt={1}>
                        <TradingCards
                            cards={user2Wishlist?.map((card) => ({
                                name: card.name,
                                image: card.image_url
                            }))}
                        />
                    </Flex>
                    <Text fontSize="sm" fontWeight="semibold" mt={1}>
                        Your hand
                    </Text>
                </VStack>
            </Card.Body>
        </Card.Root>
    )
}

export default TradeCardPopup
