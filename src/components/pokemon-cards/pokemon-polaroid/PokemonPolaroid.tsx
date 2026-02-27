'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
	Box,
	Image,
	Icon,
	Progress,
	HStack,
	Spinner,
	Heading
} from '@chakra-ui/react'

// Context
import { useAuth } from '@/context/AuthProvider'

// Icons
import { LuSparkle, LuSparkles } from 'react-icons/lu'

// Utils
import {
	userPokemonMasterSetCount,
	userPokemonGrandmasterSetCount
} from '@/utils/userPokemonCard'
import { getDynamicColour } from '@/utils/dynamicColours'
import { getPokemonName } from '@/utils/pokedex'

interface PokemonPolaroidProps {
	id: number
	masterSet: number
	grandmasterSet: number
	nextPage: string
}

const PokemonPolaroid: React.FC<PokemonPolaroidProps> = ({
	id,
	masterSet,
	grandmasterSet,
	nextPage
}: PokemonPolaroidProps) => {
	const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
	const { session } = useAuth()
	const [loading, setLoading] = useState(true)
	const [masterSetCount, setMasterSetCount] = useState<number | null>(null)
	const [grandmasterSetCount, setGrandmasterSetCount] = useState<
		number | null
	>(null)
	const [label, setLabel] = useState<string>()

	useEffect(() => {
		if (!session?.user?.id) return

		const fetchCards = async () => {
			setLoading(true)

			const masterSetCount = await userPokemonMasterSetCount(
				session.user.id,
				id
			)
			const grandmasterSetCount = await userPokemonGrandmasterSetCount(
				session.user.id,
				id
			)

			setMasterSetCount(masterSetCount)
			setGrandmasterSetCount(grandmasterSetCount)
			setLoading(false)
		}

		fetchCards()
	}, [session?.user?.id, id])

	useEffect(() => {
		const getLabel = async () => {
			setLabel(await getPokemonName(id))
		}

		getLabel()
	}, [id])

	if (loading || masterSetCount === null || grandmasterSetCount === null) {
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

	return (
		<Link
			href={{
				pathname: nextPage,
				query: { type: 'pokemon', pId: id }
			}}
			style={{ textDecoration: 'none' }}
		>
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
				cursor="pointer"
			>
				{/* Pokémon Image */}
				<Image
					src={imageUrl}
					alt={`Pokemon ${id}`}
					boxSize={{ base: '40vw', md: '200px' }}
					objectFit="contain"
					mt={2}
					css={{
						imageRendering: 'pixelated',
						transform: 'translateZ(0)'
					}}
				/>
				{label && <Heading size="md">{label}</Heading>}
				{/* Stats Section */}
				<Box w="100%" mb={2}>
					<HStack mb={1}>
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
			</Box>
		</Link>
	)
}
export default PokemonPolaroid
