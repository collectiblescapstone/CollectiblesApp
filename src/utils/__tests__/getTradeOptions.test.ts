import { CapacitorHttp } from '@capacitor/core'
import { fetchTradeOptions } from '../getTradeOptions'

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

describe('getTradeOptions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns viable options on successful response', async () => {
        const payload = {
            viableOptions: [
                {
                    cardA: { cardId: 'sv1-1', variant: 'normal', amount: 1 },
                    cardB: { cardId: 'sv1-2', variant: 'reverse', amount: 1 }
                }
            ]
        }

        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 200,
            data: payload
        })

        const result = await fetchTradeOptions('user-1')

        expect(result).toEqual(payload)
        expect(CapacitorHttp.post).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining('/api/get-viable-options'),
                data: { userID: 'user-1' }
            })
        )
    })

    it('throws when response status is outside success range', async () => {
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 503,
            data: null
        })

        await expect(fetchTradeOptions('user-1')).rejects.toThrow(
            'Failed to fetch viable options'
        )
    })
})
