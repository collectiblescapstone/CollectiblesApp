/** @jest-environment node */

import {
    authHeader,
    jsonRequest,
    mockAuthSuccess,
    mockPrisma,
    mockSupabase,
    resetApiMocks
} from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

jest.mock('@/lib/supabase', () => ({
    __esModule: true,
    supabase: mockSupabase
}))

import { POST } from '../route'

describe('POST /api/user-cards', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when bearer token is missing', async () => {
        const request = jsonRequest('http://localhost/api/user-cards', 'POST', {
            userId: 'user-1'
        })

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 403 when requesting another users data', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/user-cards',
            'POST',
            { userId: 'user-2' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(403)
        expect(body.error).toBe('Forbidden - cannot access other user data')
        expect(mockPrisma.collectionEntry.findMany).not.toHaveBeenCalled()
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid token' }
        })

        const request = jsonRequest(
            'http://localhost/api/user-cards',
            'POST',
            { userId: 'user-1' },
            authHeader('bad-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 400 when userId is missing', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/user-cards',
            'POST',
            {},
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Missing parameters')
    })

    it('returns 500 when prisma query throws', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.collectionEntry.findMany.mockRejectedValue(
            new Error('db fail')
        )

        const request = jsonRequest(
            'http://localhost/api/user-cards',
            'POST',
            { userId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)

        expect(response.status).toBe(500)
    })

    it('returns cards when request is valid', async () => {
        mockAuthSuccess('user-1')

        mockPrisma.collectionEntry.findMany.mockResolvedValue([
            {
                id: 1,
                userId: 'user-1',
                cardId: 'sv1-1',
                card: { setId: 'sv1', dexId: [1] }
            }
        ])

        const request = jsonRequest(
            'http://localhost/api/user-cards',
            'POST',
            { userId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.cards).toHaveLength(1)
        expect(mockPrisma.collectionEntry.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 'user-1' }
            })
        )
    })
})
