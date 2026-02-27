'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Box,
    Card,
    Flex,
    Heading,
    HStack,
    Icon,
    Image,
    Progress
} from '@chakra-ui/react'

// Child Components
import PokemonSetLoading from './PokemonSetLoading';

// Context
import { useAuth } from '@/context/AuthProvider'

// Icons
import { LuSparkle, LuSparkles } from 'react-icons/lu'

// Utils
import {
    userGrandmasterSetCount,
    userMasterSetCount
} from '@/utils/userPokemonCard'
import { getDynamicColour } from '@/utils/dynamicColours'

interface PokemonSetProps {
    label: string
    image: string
    setID: string
    setName: string
    masterSet: number
    grandmasterSet: number
    nextPage: string
}

const PokemonSet = ({
    label,
    image,
    setID,
    setName,
    masterSet,
    grandmasterSet,
    nextPage
}: PokemonSetProps) => {
    const { session } = useAuth()
    const [loading, setLoading] = useState(true)
    const [masterSetCount, setMasterSetCount] = useState<number | null>(null)
    const [grandmasterSetCount, setGrandmasterSetCount] = useState<
        number | null
    >(null)

    useEffect(() => {
        if (!session?.user?.id) return

        const fetchCards = async () => {
            setLoading(true)

            const masterSetCount = await userMasterSetCount(
                session.user.id,
                setID
            )
            const grandmasterSetCount = await userGrandmasterSetCount(
                session.user.id,
                setID
            )

            setMasterSetCount(masterSetCount)
            setGrandmasterSetCount(grandmasterSetCount)
            setLoading(false)
        }

        fetchCards()
    }, [session?.user?.id, setID])

    // console.log(
    //     setID,
    //     '| Master Set: ',
    //     masterSetCount,
    //     '/',
    //     masterSet,
    //     ' | Grandmaster Set: ',
    //     grandmasterSetCount,
    //     '/',
    //     grandmasterSet
    // );

    if (loading || masterSetCount === null || grandmasterSetCount === null) {
        return <PokemonSetLoading />

    }

    return (
        <Box w="100%" maxW="300px" mx="auto">
            <Link
                href={{
                    pathname: nextPage,
                    query: { type: 'set', setId: setID, setName: setName }
                }}
                style={{ textDecoration: 'none' }}
            >
                <Card.Root
                    direction="column"
                    overflow="hidden"
                    w={{ base: '100%', md: '300px' }}
                    h="200px"
                    bg="white"
                    borderRadius="lg"
                    boxShadow="md"
                    _hover={{ transform: 'scale(1.02)', boxShadow: 'xl' }}
                    transition="0.2s ease"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    cursor="pointer"
                >
                    {/* Image section */}
                    <Flex
                        align="center"
                        justify="center"
                        h="50%"
                        bg="gray.50"
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        width="100%"
                        padding={2}
                    >
                        <Image
                            src={image}
                            alt={label}
                            objectFit="contain"
                            maxH="100%"
                            maxW="90%"
                            // p={4}
                            style={{
                                imageRendering: 'pixelated',
                                transform: 'translateZ(0)'
                            }}
                            align="center"
                        />
                    </Flex>

                    {/* Text + Progress bars */}
                    <Card.Body
                        h="30%"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        textAlign="center"
                        p={4}
                    >
                        <Heading size="md">{label}</Heading>
                        {/* <Text color="gray.600" mt={2}>
              {setID} Troubleshooting code to show the set ID
            </Text> */}

                        {/* Progress bars section */}
                        <Box mt={4} w="100%">
                            <HStack mb={2}>
                                <Icon
                                    as={LuSparkle}
                                    color={getDynamicColour(
                                        masterSetCount || 0,
                                        masterSet || 1,
                                        45,
                                        51
                                    )}
                                    boxSize={4}
                                />
                                <Progress.Root
                                    value={masterSetCount || 0}
                                    max={masterSet || 1}
                                    w="100%"
                                    h="6px"
                                    borderRadius="full"
                                    overflow="hidden"
                                >
                                    <Progress.Track bg="gray.100">
                                        <Progress.Range
                                            bg={getDynamicColour(
                                                masterSetCount || 0,
                                                masterSet || 1,
                                                45,
                                                51
                                            )}
                                        />
                                    </Progress.Track>
                                </Progress.Root>
                            </HStack>

                            <HStack>
                                <Icon
                                    as={LuSparkles}
                                    color={getDynamicColour(
                                        grandmasterSetCount || 0,
                                        grandmasterSet || 1,
                                        182,
                                        50
                                    )}
                                    boxSize={4}
                                />
                                <Progress.Root
                                    value={grandmasterSetCount || 0}
                                    max={grandmasterSet || 1}
                                    w="100%"
                                    h="6px"
                                    borderRadius="full"
                                    overflow="hidden"
                                >
                                    <Progress.Track bg="gray.100">
                                        <Progress.Range
                                            bg={getDynamicColour(
                                                grandmasterSetCount || 0,
                                                grandmasterSet || 1,
                                                182,
                                                50
                                            )}
                                        />
                                    </Progress.Track>
                                </Progress.Root>
                            </HStack>
                        </Box>
                    </Card.Body>
                </Card.Root>
            </Link>
        </Box>
    )
}

export default PokemonSet
