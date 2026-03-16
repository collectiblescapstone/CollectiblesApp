import type { PokemonSubset } from '@/types/Cards/frontend-card'

export function formatCardNumber(
    cardId: string,
    cardNumber: string | undefined,
    setId: string,
    setOfficial: number | undefined,
    pokemonSubsets: Record<string, PokemonSubset[]>
) {
    const fullId = cardNumber ?? cardId

    // Extract prefix (TG, GG, etc.)
    const lettersMatch = fullId.match(/^[A-Za-z]+/)
    const letters = lettersMatch ? lettersMatch[0] : ''

    const numberPartRaw = fullId.replace(letters, '')

    const subsetsForSet = pokemonSubsets[setId] || []

    const subsetMatch = subsetsForSet.find(
        (subset) => subset.prefix === letters
    )

    const officialCount = subsetMatch
        ? subsetMatch.official
        : Number(setOfficial) || 0

    // 🔹 NEW LOGIC
    const padLength = letters ? String(officialCount).length : 3

    const numberPart = numberPartRaw.padStart(padLength, '0')

    const officialPart =
        officialCount > 0
            ? '/' + (letters ? letters + officialCount : officialCount)
            : ''

    return (letters ? letters : '') + numberPart + officialPart
}
