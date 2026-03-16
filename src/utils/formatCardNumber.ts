import type { PokemonSubset } from '@/types/Cards/frontend-card'

export const formatCardNumber = (
    cardId: string,
    cardNumber: string | undefined,
    setId: string,
    setOfficial: number | undefined,
    pokemonSubsets: Record<string, PokemonSubset[]>,
    setName: string
) => {
    const fullId = cardNumber ?? cardId

    // Extract prefix (TG, GG, etc.)
    const lettersMatch = fullId.match(/^[A-Za-z]+/)
    const letters = lettersMatch ? lettersMatch[0] : ''

    const numberPartRaw = fullId.replace(letters, '')

    const subsetsForSet = pokemonSubsets[setId] || []

    const subsetMatch = subsetsForSet.find(
        (subset) => subset.prefix === letters
    )

    const padLengthOverride = setName.includes("McDonald's") ? 0 : 3

    // Determine official count and pad length
    const officialCount = subsetMatch
        ? subsetMatch.official
        : Number(setOfficial) || 0

    // For subsets, pad to length of subset official
    // Base set: at least 3
    const padLength = subsetMatch
        ? String(officialCount).length
        : padLengthOverride

    // Pad number part
    const numberPart = numberPartRaw.padStart(padLength, '0')

    // Pad official part
    const officialPart =
        officialCount > 0
            ? '/' +
              (letters ? letters : '') +
              String(officialCount).padStart(padLength, '0')
            : ''

    return (letters ? letters : '') + numberPart + officialPart
}
