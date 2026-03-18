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

describe('POST /api/collection/showcase', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when bearer token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/collection/showcase',
            'POST'
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid token' }
        })

        const request = jsonRequest(
            'http://localhost/api/collection/showcase',
            'POST',
            {},
            authHeader('bad-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 200 with showcase count and data', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.collectionEntry.findMany.mockResolvedValue([
            { id: 1 },
            { id: 2 }
        ])

        const request = jsonRequest(
            'http://localhost/api/collection/showcase',
            'POST',
            {},
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe(
            'Number of cards in showcase retrieved successfully'
        )
        expect(body.showcaseCount).toBe(2)
        expect(body.data).toEqual([{ id: 1 }, { id: 2 }])
        expect(mockPrisma.collectionEntry.findMany).toHaveBeenCalledWith({
            where: {
                userId: 'user-1',
                showcase: true
            },
            select: {
                id: true
            }
        })
    })
})
