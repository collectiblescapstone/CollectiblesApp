import { CapacitorHttp } from '@capacitor/core'
import { fetchUserProfile } from '../userIDProfilePuller'

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

describe('userIDProfilePuller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns profile data for a successful response', async () => {
        const profile = { id: 'u1', username: 'ash' }
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 200,
            data: profile
        })

        const result = await fetchUserProfile('u1')

        expect(result).toEqual(profile)
        expect(CapacitorHttp.post).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining('/api/get-user-by-userID'),
                data: { userID: 'u1' }
            })
        )
    })

    it('throws when response status is not successful', async () => {
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 500,
            data: null
        })

        await expect(fetchUserProfile('u1')).rejects.toThrow(
            'Failed to fetch user profile'
        )
    })
})
