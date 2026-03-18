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

describe('POST /api/collection/edit', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when bearer token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/collection/edit',
            'POST',
            { entryId: 123, cardId: 'sv1-1' }
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 404 when entry cannot be found for user', async () => {
        mockAuthSuccess('user-1')

        mockPrisma.collectionEntry.findFirst.mockResolvedValue(null)

        const request = jsonRequest(
            'http://localhost/api/collection/edit',
            'POST',
            { entryId: 123, cardId: 'sv1-1' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(404)
        expect(body.message).toBe('Card ID invalid')
    })

    it('returns 200 and updates entry when found', async () => {
        mockAuthSuccess('user-1')

        mockPrisma.collectionEntry.findFirst.mockResolvedValue({
            id: 123,
            userId: 'user-1'
        })

        mockPrisma.collectionEntry.update.mockResolvedValue({
            id: 123,
            userId: 'user-1',
            cardId: 'sv1-2'
        })

        const request = jsonRequest(
            'http://localhost/api/collection/edit',
            'POST',
            { entryId: 123, cardId: 'sv1-2', condition: 'LP' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Saved to collection')
        expect(mockPrisma.collectionEntry.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 123 },
                data: expect.objectContaining({
                    userId: 'user-1',
                    cardId: 'sv1-2',
                    condition: 'LP'
                })
            })
        )
    })
})
