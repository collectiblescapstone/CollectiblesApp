/** @jest-environment node */

import {
    authHeader,
    jsonRequest,
    mockPrisma,
    resetApiMocks
} from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

import { POST } from '../route'

describe('POST /api/home-page', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when token is missing', async () => {
        const request = jsonRequest('http://localhost/api/home-page', 'POST', {
            userID: 'user-1'
        })

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 404 when user does not exist', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null)

        const request = jsonRequest(
            'http://localhost/api/home-page',
            'POST',
            { userID: 'user-1' },
            authHeader('token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(404)
        expect(body.error).toBe('User not found')
    })

    it('returns 400 when userID is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/home-page',
            'POST',
            {},
            authHeader('token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('No userID given, fetch terminated')
    })

    it('returns empty popular cards when there are no grouped card ids', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            username: 'ash',
            firstName: 'Ash'
        })
        mockPrisma.collectionEntry.count
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0)
        mockPrisma.collectionEntry.findMany.mockResolvedValue([])
        mockPrisma.collectionEntry.groupBy.mockResolvedValue([])

        const request = jsonRequest(
            'http://localhost/api/home-page',
            'POST',
            { userID: 'user-1' },
            authHeader('token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.popularCards).toEqual([])
        expect(mockPrisma.card.findMany).not.toHaveBeenCalled()
    })

    it('returns 500 when prisma throws', async () => {
        mockPrisma.user.findUnique.mockRejectedValue(new Error('db fail'))

        const request = jsonRequest(
            'http://localhost/api/home-page',
            'POST',
            { userID: 'user-1' },
            authHeader('token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Internal Server Error')
    })

    it('returns dashboard data on success', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
            username: 'ash',
            firstName: 'Ash'
        })
        mockPrisma.collectionEntry.count
            .mockResolvedValueOnce(10)
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(3)
        mockPrisma.collectionEntry.findMany.mockResolvedValue([
            { card: { name: 'Pikachu', image_url: 'pikachu.png' } }
        ])
        mockPrisma.collectionEntry.groupBy.mockResolvedValue([
            { cardId: 'sv1-1', _count: { cardId: 2 } }
        ])
        mockPrisma.card.findMany.mockResolvedValue([
            { id: 'sv1-1', name: 'Pikachu', image_url: 'pikachu.png' }
        ])

        const request = jsonRequest(
            'http://localhost/api/home-page',
            'POST',
            { userID: 'user-1' },
            authHeader('token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.cardsInCollection).toBe(10)
        expect(body.cardsForTrade).toBe(4)
        expect(body.cardsLoggedthisMonth).toBe(3)
        expect(body.popularCards).toHaveLength(1)
        expect(body.recentCards).toEqual([
            { name: 'Pikachu', imageUrl: 'pikachu.png' }
        ])
    })
})
