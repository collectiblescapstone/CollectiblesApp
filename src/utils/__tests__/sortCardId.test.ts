import { sortCardId } from '../sortCardId'

describe('sortCardId', () => {
    it('sorts ids with same prefix by numeric portion', () => {
        const ids = ['sv10', 'sv2', 'sv1']
        const sorted = [...ids].sort(sortCardId)

        expect(sorted).toEqual(['sv1', 'sv2', 'sv10'])
    })

    it('sorts by prefix when both values match regex', () => {
        expect(sortCardId('swsh1', 'sv1')).toBeGreaterThan(0)
        expect(sortCardId('base2', 'bw3')).toBeLessThan(0)
    })

    it('puts matching values before non-matching values', () => {
        expect(sortCardId('123', 'promo-abc')).toBeLessThan(0)
        expect(sortCardId('promo-abc', '123')).toBeGreaterThan(0)
    })

    it('falls back to lexicographic sort when neither matches pattern', () => {
        expect(sortCardId('abc', 'abd')).toBeLessThan(0)
        expect(sortCardId('z-set', 'a-set')).toBeGreaterThan(0)
    })

    it('handles number-only ids using empty prefixes', () => {
        const ids = ['10', '2', '1']
        const sorted = [...ids].sort(sortCardId)

        expect(sorted).toEqual(['1', '2', '10'])
        expect(sortCardId('2', 'sv1')).toBeLessThan(0)
    })
})
