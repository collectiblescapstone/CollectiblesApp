import { ALL_POKEMON, MAXPOKEDEXVALUE } from '../pokedex'

describe('pokedex utils', () => {
    it('defines MAXPOKEDEXVALUE as 1025', () => {
        expect(MAXPOKEDEXVALUE).toBe(1025)
    })

    it('generates ALL_POKEMON as an array of numbers from 1 to MAXPOKEDEXVALUE', () => {
        expect(ALL_POKEMON.length).toBe(MAXPOKEDEXVALUE)
        expect(ALL_POKEMON[0]).toBe(1)
        expect(ALL_POKEMON[MAXPOKEDEXVALUE - 1]).toBe(MAXPOKEDEXVALUE)
    })
})
