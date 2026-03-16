export const sortSetIds = (a: string, b: string) => {
    const regex = /^([a-zA-Z]+)(\d+(?:\.\d+)?)$/ // prefix + number (supports decimals)
    const matchA = a.match(regex)
    const matchB = b.match(regex)

    if (!matchA || !matchB) return a.localeCompare(b)

    const prefixA = matchA[1]
    const prefixB = matchB[1]

    if (prefixA !== prefixB) return prefixA.localeCompare(prefixB)

    const numA = parseFloat(matchA[2])
    const numB = parseFloat(matchB[2])

    return numA - numB
}
