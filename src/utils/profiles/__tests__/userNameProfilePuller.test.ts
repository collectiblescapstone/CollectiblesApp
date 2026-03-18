import { CapacitorHttp } from '@capacitor/core'
import { fetchUserProfile } from '../userNameProfilePuller'

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

describe('userNameProfilePuller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns profile data for a successful response', async () => {
        const profile = { id: 'u2', username: 'misty' }
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 200,
            data: profile
        })

        const result = await fetchUserProfile('misty')

        expect(result).toEqual(profile)
        expect(CapacitorHttp.post).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining('/api/get-user-by-username'),
                data: { userName: 'misty' }
            })
        )
    })

    it('throws when response status is outside success range', async () => {
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 404,
            data: null
        })

        await expect(fetchUserProfile('misty')).rejects.toThrow(
            'Failed to fetch user profile'
        )
    })
})
