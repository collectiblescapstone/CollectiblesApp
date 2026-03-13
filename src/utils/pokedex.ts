export const MAXPOKEDEXVALUE = 1025

export const ALL_POKEMON = Array.from(
    { length: MAXPOKEDEXVALUE },
    (_, i) => i + 1
)
