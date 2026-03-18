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

describe('POST /api/collection/read', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when bearer token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/collection/read',
            'POST',
            { cardId: 123 }
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 400 when cardId is missing', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/collection/read',
            'POST',
            {},
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('cardId is required')
    })

    it('returns 200 with collection entry when found', async () => {
        mockAuthSuccess('user-1')

        mockPrisma.collectionEntry.findFirst.mockResolvedValue({
            id: 123,
            userId: 'user-1',
            cardId: 'sv1-1'
        })

        const request = jsonRequest(
            'http://localhost/api/collection/read',
            'POST',
            { cardId: 123 },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Collection card retrieved')
        expect(mockPrisma.collectionEntry.findFirst).toHaveBeenCalledWith({
            where: {
                id: 123,
                userId: 'user-1'
            }
        })
    })
})
