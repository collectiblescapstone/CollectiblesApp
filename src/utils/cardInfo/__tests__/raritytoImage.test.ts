import { checkRarityExists, getRarityImage } from '../raritytoImage'

describe('raritytoImage utils', () => {
    it('returns mapped rarity image path (case-insensitive)', () => {
        expect(getRarityImage('Common')).toBe(
            '/Images/CardRarity/Rarity_Common.png'
        )
        expect(getRarityImage('special illustration rare')).toBe(
            '/Images/CardRarity/Rarity_Special_Illustration_Rare.png'
        )
    })

    it('checks if rarity exists in map', () => {
        expect(checkRarityExists('ULTRA RARE')).toBe(true)
        expect(checkRarityExists('not-a-rarity')).toBe(false)
    })

    it('falls back to common image for unknown rarity value', () => {
        expect(getRarityImage('unknown')).toBe(
            '/Images/CardRarity/Rarity_Common.png'
        )
    })
})
