import { sortSetIds } from '../formatSetNumber'

describe('sortSetIds', () => {
    it('sorts ids with same prefix by numeric part', () => {
        const ids = ['sv10', 'sv2', 'sv1']
        const sorted = [...ids].sort(sortSetIds)

        expect(sorted).toEqual(['sv1', 'sv2', 'sv10'])
    })

    it('sorts decimal numeric ids correctly', () => {
        const ids = ['ex2', 'ex1.5', 'ex1']
        const sorted = [...ids].sort(sortSetIds)

        expect(sorted).toEqual(['ex1', 'ex1.5', 'ex2'])
    })

    it('sorts by prefix when prefixes differ', () => {
        expect(sortSetIds('sv1', 'xy2')).toBeLessThan(0)
        expect(sortSetIds('swsh1', 'sm1')).toBeGreaterThan(0)
    })

    it('falls back to localeCompare for non-matching formats', () => {
        expect(sortSetIds('base-set', 'sv1')).toBeLessThan(0)
        expect(sortSetIds('promo', 'base-set')).toBeGreaterThan(0)
    })
})
