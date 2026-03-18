import { getDynamicColour } from '../dynamicColours'

describe('dyamicColours utils', () => {
    it('returns the correct color for a given prop', () => {
        expect(getDynamicColour(5, 10, 120)).toBe('hsl(120, 100%, 25.5%)')
    })

    it('handles zero denominator gracefully', () => {
        expect(getDynamicColour(5, 0, 120)).toBe('hsl(120, 100%, 0%)')
    })

    it('handles zero numerator gracefully', () => {
        expect(getDynamicColour(0, 10, 120)).toBe('hsl(120, 100%, 0%)')
    })

    it('handles numerator greater than denominator gracefully', () => {
        expect(getDynamicColour(15, 10, 120)).toBe('hsl(120, 100%, 51%)')
    })

    it('handles custom lightness value', () => {
        expect(getDynamicColour(5, 10, 120, 70)).toBe('hsl(120, 100%, 35%)')
    })
})
