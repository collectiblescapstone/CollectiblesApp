import { formatCardNumber } from '../formatCardNumber'

describe('formatCardNumber', () => {
    it('formats base-set number with default 3-digit padding', () => {
        const result = formatCardNumber(
            'sv1-4',
            '4',
            'sv1',
            198,
            undefined,
            'Scarlet & Violet'
        )

        expect(result).toBe('004/198')
    })

    it('uses cardId when cardNumber is undefined', () => {
        const result = formatCardNumber(
            '123',
            undefined,
            'sv1',
            198,
            undefined,
            'Scarlet & Violet'
        )

        expect(result).toBe('123/198')
    })

    it('formats subset card numbers with subset-specific official count', () => {
        const result = formatCardNumber(
            'tg-ignored',
            'TG4',
            'swsh12',
            200,
            {
                swsh12: [
                    { name: 'Trainer Gallery', prefix: 'TG', official: 30 }
                ]
            },
            'Silver Tempest'
        )

        expect(result).toBe('TG04/TG30')
    })

    it('uses no left-padding for McDonald sets', () => {
        const result = formatCardNumber(
            'mc-7',
            '7',
            'mcd',
            15,
            undefined,
            "McDonald's Collection"
        )

        expect(result).toBe('7/15')
    })

    it('omits official part when official count is zero', () => {
        const result = formatCardNumber(
            'promo-a1',
            'A1',
            'promo',
            0,
            undefined,
            'Promo'
        )

        expect(result).toBe('A001')
    })
})
