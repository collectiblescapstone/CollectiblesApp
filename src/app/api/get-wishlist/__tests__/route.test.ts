/** @jest-environment node */

import { jsonRequest, mockPrisma, resetApiMocks } from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

import { POST } from '../route'

describe('POST /api/get-wishlist', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns wishlist entries for user', async () => {
        mockPrisma.wishlistEntry.findMany.mockResolvedValue([
            { id: 1, userId: 'user-1', cardId: 'sv1-1' }
        ])

        const request = jsonRequest(
            'http://localhost/api/get-wishlist',
            'POST',
            { userId: 'user-1' }
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body).toHaveLength(1)
        expect(mockPrisma.wishlistEntry.findMany).toHaveBeenCalledWith({
            where: { userId: 'user-1' }
        })
    })

    it('returns 500 when prisma throws', async () => {
        mockPrisma.wishlistEntry.findMany.mockRejectedValue(
            new Error('db fail')
        )

        const request = jsonRequest(
            'http://localhost/api/get-wishlist',
            'POST',
            { userId: 'user-1' }
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Internal Server Error')
    })
})
