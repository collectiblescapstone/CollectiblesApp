export const sortCardId = (a: string, b: string) => {
    const regex = /^([A-Za-z\-]*)(\d+)$/

    const matchA = a.match(regex)
    const matchB = b.match(regex)

    // If both match pattern
    if (matchA && matchB) {
        const prefixA = matchA[1] || '' // prefix may be empty
        const prefixB = matchB[1] || ''
        const numA = parseInt(matchA[2], 10)
        const numB = parseInt(matchB[2], 10)

        // Compare prefixes first
        if (prefixA !== prefixB) return prefixA.localeCompare(prefixB)

        // Then numeric part
        return numA - numB
    }

    // If only one matches, put number-only first
    if (matchA && !matchB) return -1
    if (!matchA && matchB) return 1

    // Fallback lexicographic sort
    return a.localeCompare(b)
}
