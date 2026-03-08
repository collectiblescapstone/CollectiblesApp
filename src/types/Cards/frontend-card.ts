export type PokemonCard = {
    name: string
    category: string
    types: string[]
    illustrator: string
    rarity: string
    variants: string[]
    dexId: number[]
    image_url: string
    setId: string
}

export type PokemonSet = {
    name: string
    series: string
    logo: string
    symbol: string
    official: number
    total: number
}
