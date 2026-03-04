'use client';

import React, { useState } from 'react';
import {
    Card,
    HStack,
    VStack,
    Stack,
    Text,
    IconButton,
} from '@chakra-ui/react';
import TradingCards from '@/components/trading/TradingCards';
import {
    LuArrowRightLeft,
} from 'react-icons/lu';
import{
    SiInstagram,
    SiX,
    SiFacebook,
    SiDiscord,
    SiWhatsapp,
} from 'react-icons/si';

type ContactMethod = {
    method: string;
    value: string;
};

type TradeCardProps = {
    username: string;
    contacts?: ContactMethod[];
};

const TradeCardPopup: React.FC<TradeCardProps> = (props) =>{
    const { username, contacts } = props;
    // helper to normalise contact method names and check existence
    const normalize = (s?: string) => (s ?? '').toLowerCase().replace(/\s+/g, '');
    const hasContact = (names: string[]) => !!contacts?.some(c => names.includes(normalize(c.method)));
    const getContactValue = (names: string[]) => contacts?.find(c => names.includes(normalize(c.method)))?.value;

    // state to show small inline confirmation when something is copied
    const [copied, setCopied] = useState<string | null>(null);

    // copy the contact value (build profile URL for social methods) to the clipboard quietly (no toast)
    const copyToClipboard = async (types: string[]) => {
        const value = getContactValue(types);
        if (!value) return;
        const v = value.trim();
        const primary = types[0];

        // build a sensible profile/link value per type
        let toCopy = v;
        if (primary === 'instagram') {
            const handle = v.replace(/^@/, '');
            toCopy = v.startsWith('http') ? v : `https://instagram.com/${handle}`;
        } else if (primary === 'x' || primary === 'twitter') {
            const handle = v.replace(/^@/, '');
            toCopy = v.startsWith('http') ? v : `https://x.com/${handle}`;
        } else if (primary === 'facebook') {
            const handle = v.replace(/^@/, '');
            toCopy = v.startsWith('http') ? v : `https://facebook.com/${handle}`;
        } else if (primary === 'whatsapp') {
            const digits = v.replace(/\D/g, '');
            toCopy = digits ? `https://wa.me/${digits}` : v;
        } else if (primary === 'discord') {
            // Discord can't be reliably converted to a public profile URL from name
            // so copy the raw handle
            toCopy = v;
        }

        try {
            await navigator.clipboard.writeText(toCopy);
            setCopied(primary);
            window.setTimeout(() => setCopied(null), 1500);
        } catch (e) {
            // copy failed - log for debugging
            console.error('Copy to clipboard failed', e);
        }
    }

    return (
        <Card.Root width="100%">
            {/* add small vertical padding so there's space at top/bottom */}
            <Card.Body py={3}>
                {/*their cards*/}
                <VStack align="center" gap={2}>
                    <TradingCards />
                    <VStack align="center" gap="0">
                        <HStack mb="0" gap="3">
                            <Stack gap="0">
                                <Text fontWeight="semibold" textStyle="sm">
                                    {username}
                                </Text>
                            </Stack>
                        </HStack>
                        <HStack>
                            {hasContact(['instagram']) && (
                                <HStack key="instagram">
                                    <IconButton aria-label="instagram" onClick={() => copyToClipboard(['instagram'])}>
                                        <SiInstagram size={20} />
                                    </IconButton>
                                    {copied === 'instagram' && <Text fontSize="xs" color="green.500">Copied</Text>}
                                </HStack>
                            )}
                            {hasContact(['x','twitter']) && (
                                <HStack key="x">
                                    <IconButton aria-label="x" onClick={() => copyToClipboard(['x','twitter'])}>
                                        <SiX size={20} />
                                    </IconButton>
                                    {copied === 'x' && <Text fontSize="xs" color="green.500">Copied</Text>}
                                </HStack>
                            )}
                            {hasContact(['facebook']) && (
                                <HStack key="facebook">
                                    <IconButton aria-label="facebook" onClick={() => copyToClipboard(['facebook'])}>
                                        <SiFacebook size={20} />
                                    </IconButton>
                                    {copied === 'facebook' && <Text fontSize="xs" color="green.500">Copied</Text>}
                                </HStack>
                            )}
                            {hasContact(['whatsapp']) && (
                                <HStack key="whatsapp">
                                    <IconButton aria-label="whatsapp" onClick={() => copyToClipboard(['whatsapp'])}>
                                        <SiWhatsapp size={20} />
                                    </IconButton>
                                    {copied === 'whatsapp' && <Text fontSize="xs" color="green.500">Copied</Text>}
                                </HStack>
                            )}
                            {hasContact(['discord']) && (
                                <HStack key="discord">
                                    <IconButton aria-label="discord" onClick={() => copyToClipboard(['discord'])}>
                                        <SiDiscord size={20} />
                                    </IconButton>
                                    {copied === 'discord' && <Text fontSize="xs" color="green.500">Copied</Text>}
                                </HStack>
                            )}
                        </HStack>
                    </VStack>

                <LuArrowRightLeft size={30} />

                {/*/!*your cards*!/*/}
                  <TradingCards />
                  <Text fontSize="sm" fontWeight="semibold">Your cards</Text>
                </VStack>
            </Card.Body>
        </Card.Root>
    )
};

export default TradeCardPopup;