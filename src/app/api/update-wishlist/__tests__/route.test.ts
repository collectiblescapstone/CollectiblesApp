/** @jest-environment node */

import { jsonRequest, mockPrisma, resetApiMocks } from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

import { POST } from '../route'

describe('POST /api/update-wishlist', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 400 when card does not exist', async () => {
        mockPrisma.card.findFirst.mockResolvedValue(null)

        const request = jsonRequest(
            'http://localhost/api/update-wishlist',
            'POST',
            { userId: 'user-1', cardId: 'bad-card' }
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Requested card ID does not exist')
    })

    it('removes wishlist entry when remove is true and entry exists', async () => {
        mockPrisma.card.findFirst.mockResolvedValue({ id: 'sv1-1' })
        mockPrisma.wishlistEntry.findFirst.mockResolvedValue({
            userId: 'user-1',
            cardId: 'sv1-1'
        })
        mockPrisma.wishlistEntry.deleteMany.mockResolvedValue({ count: 1 })

        const request = jsonRequest(
            'http://localhost/api/update-wishlist',
            'POST',
            { userId: 'user-1', cardId: 'sv1-1', remove: true }
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Wishlist entry removed successfully')
    })

    it('creates wishlist entry when missing and remove is false', async () => {
        mockPrisma.card.findFirst.mockResolvedValue({ id: 'sv1-1' })
        mockPrisma.wishlistEntry.findFirst.mockResolvedValue(null)
        mockPrisma.wishlistEntry.create.mockResolvedValue({
            userId: 'user-1',
            cardId: 'sv1-1'
        })

        const request = jsonRequest(
            'http://localhost/api/update-wishlist',
            'POST',
            { userId: 'user-1', cardId: 'sv1-1' }
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Wishlist entry created successfully')
        expect(mockPrisma.wishlistEntry.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-1',
                cardId: 'sv1-1'
            }
        })
    })
})
