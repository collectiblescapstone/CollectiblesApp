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

describe('POST /api/collection/save', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when bearer token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/collection/save',
            'POST',
            { cardId: 'sv1-1' }
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
        expect(mockSupabase.auth.getUser).not.toHaveBeenCalled()
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid token' }
        })

        const request = jsonRequest(
            'http://localhost/api/collection/save',
            'POST',
            { cardId: 'sv1-1' },
            authHeader('invalid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
        expect(mockPrisma.collectionEntry.create).not.toHaveBeenCalled()
    })

    it('returns 200 and saves collection entry when valid', async () => {
        mockAuthSuccess('user-1')

        mockPrisma.collectionEntry.create.mockResolvedValue({
            id: 123,
            userId: 'user-1',
            cardId: 'sv1-1'
        })

        const request = jsonRequest(
            'http://localhost/api/collection/save',
            'POST',
            { cardId: 'sv1-1', condition: 'NM' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Saved to collection')
        expect(mockPrisma.collectionEntry.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: 'user-1',
                    cardId: 'sv1-1',
                    condition: 'NM'
                })
            })
        )
    })
})
