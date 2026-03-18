import { CapacitorHttp } from '@capacitor/core'
import { getWishlist, updateWishlist } from '../wishlistQueries'

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

describe('wishlistQueries', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns wishlist entries for successful getWishlist response', async () => {
        const wishlist = [{ id: 1, userId: 'u1', cardId: 'sv1-1' }]
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 200,
            data: wishlist
        })

        const result = await getWishlist('u1')

        expect(result).toEqual(wishlist)
        expect(CapacitorHttp.post).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining('/api/get-wishlist'),
                data: { userId: 'u1' }
            })
        )
    })

    it('throws when getWishlist receives non-2xx response', async () => {
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 500,
            data: null
        })

        await expect(getWishlist('u1')).rejects.toThrow(
            "Failed to update user's wishlist"
        )
    })

    it('returns response data for successful updateWishlist request', async () => {
        const payload = { success: true }
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 201,
            data: payload
        })

        const result = await updateWishlist('u1', 'sv1-2', true)

        expect(result).toEqual(payload)
        expect(CapacitorHttp.post).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining('/api/update-wishlist'),
                data: { userId: 'u1', cardId: 'sv1-2', remove: true }
            })
        )
    })

    it('throws when updateWishlist receives non-2xx response', async () => {
        ;(CapacitorHttp.post as jest.Mock).mockResolvedValue({
            status: 400,
            data: null
        })

        await expect(updateWishlist('u1', 'sv1-2')).rejects.toThrow(
            "Failed to update user's wishlist"
        )
    })
})
