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

import { DELETE } from '../route'

describe('DELETE /api/collection/delete', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when bearer token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/collection/delete',
            'DELETE',
            { entryId: 123 }
        )

        const response = await DELETE(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 404 when entry id does not exist for user', async () => {
        mockAuthSuccess('user-1')

        mockPrisma.collectionEntry.deleteMany.mockResolvedValue({ count: 0 })

        const request = jsonRequest(
            'http://localhost/api/collection/delete',
            'DELETE',
            { entryId: 123 },
            authHeader('valid-token')
        )

        const response = await DELETE(request as any)
        const body = await response.json()

        expect(response.status).toBe(404)
        expect(body.message).toBe('Entry ID invalid')
    })

    it('returns 200 when entry is deleted', async () => {
        mockAuthSuccess('user-1')

        mockPrisma.collectionEntry.deleteMany.mockResolvedValue({ count: 1 })

        const request = jsonRequest(
            'http://localhost/api/collection/delete',
            'DELETE',
            { entryId: 123 },
            authHeader('valid-token')
        )

        const response = await DELETE(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Entry deleted from collection')
        expect(mockPrisma.collectionEntry.deleteMany).toHaveBeenCalledWith({
            where: {
                userId: 'user-1',
                id: 123
            }
        })
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid token' }
        })

        const request = jsonRequest(
            'http://localhost/api/collection/delete',
            'DELETE',
            { entryId: 123 },
            authHeader('bad-token')
        )

        const response = await DELETE(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 400 when entryId is missing', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/collection/delete',
            'DELETE',
            {},
            authHeader('valid-token')
        )

        const response = await DELETE(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('entryId is required')
    })

    it('returns 500 when delete query throws', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.collectionEntry.deleteMany.mockRejectedValue(
            new Error('db fail')
        )

        const request = jsonRequest(
            'http://localhost/api/collection/delete',
            'DELETE',
            { entryId: 123 },
            authHeader('valid-token')
        )

        const response = await DELETE(request as any)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Internal Server Error')
    })
})
