import { CapacitorHttp } from '@capacitor/core'
import { fetchUserData } from '../userDataPuller'

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

describe('userDataPuller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns user data for successful response', async () => {
        const payload = {
            collectionCount: 12,
            tradeCount: 3,
            wishlistCount: 5
        }

        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 200,
            data: payload
        })

        const result = await fetchUserData('user-1', 'token-abc')

        expect(result).toEqual(payload)
        expect(CapacitorHttp.post).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining('/api/home-page'),
                data: { userID: 'user-1' },
                headers: expect.objectContaining({
                    Authorization: 'Bearer token-abc'
                })
            })
        )
    })

    it('throws when response status is not successful', async () => {
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 401,
            data: null
        })

        await expect(fetchUserData('user-1', 'bad-token')).rejects.toThrow(
            'Failed to fetch user data'
        )
    })
})
