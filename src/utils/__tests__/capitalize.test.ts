import { capitalizeEachWord, capitalizeWord } from '../capitalize'

describe('capitalize utils', () => {
    describe('capitalizeWord', () => {
        it('capitalizes the first letter of a string', () => {
            expect(capitalizeWord('near')).toBe('Near')
            expect(capitalizeWord('mint')).toBe('Mint')
        })

        it('capitalizes the first letter after a space', () => {
            expect(capitalizeWord('near mint')).toBe('Near Mint')
            expect(capitalizeWord('damaged card')).toBe('Damaged Card')
        })

        it('capitalizes the first letter after a parenthesis', () => {
            expect(capitalizeWord('card (holo)')).toBe('Card (Holo)')
            expect(capitalizeWord('set (base)')).toBe('Set (Base)')
        })

        it('returns the original string if it is empty or has no letters', () => {
            expect(capitalizeWord('')).toBe('')
            expect(capitalizeWord('123')).toBe('123')
        })
    })

    describe('capitalizeEachWord', () => {
        it('capitalizes the first letter of each word in a sentence', () => {
            expect(capitalizeEachWord('near mint condition')).toBe(
                'Near Mint Condition'
            )
            expect(capitalizeEachWord('damaged card with holo')).toBe(
                'Damaged Card With Holo'
            )
        })

        it('handles empty strings gracefully', () => {
            expect(capitalizeEachWord('')).toBe('')
        })
    })
})
