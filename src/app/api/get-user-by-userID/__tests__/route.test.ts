/** @jest-environment node */

import { jsonRequest, mockPrisma, resetApiMocks } from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

import { POST } from '../route'

describe('POST /api/get-user-by-userID', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 400 when userID is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/get-user-by-userID',
            'POST',
            {}
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('No userID given, fetch terminated')
    })

    it('returns 404 when user does not exist', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null)

        const request = jsonRequest(
            'http://localhost/api/get-user-by-userID',
            'POST',
            { userID: 'user-1' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(404)
        expect(body.error).toBe('User not found')
    })

    it('returns profile with trade and showcase lists', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            username: 'ash',
            wishlist: []
        })
        mockPrisma.collectionEntry.findMany
            .mockResolvedValueOnce([{ card: { name: 'Pikachu' } }])
            .mockResolvedValueOnce([{ card: { name: 'Charizard' } }])

        const request = jsonRequest(
            'http://localhost/api/get-user-by-userID',
            'POST',
            { userID: 'user-1' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.id).toBe('user-1')
        expect(body.tradeList).toHaveLength(1)
        expect(body.showcaseList).toHaveLength(1)
    })
})
