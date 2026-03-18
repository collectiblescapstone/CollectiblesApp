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

describe('POST /api/get-searchable-users', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when bearer token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/get-searchable-users',
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
            'http://localhost/api/get-searchable-users',
            'POST',
            {},
            authHeader('bad-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
        expect(mockPrisma.user.findMany).not.toHaveBeenCalled()
    })

    it('returns users excluding requester', async () => {
        mockAuthSuccess('user-1')

        mockPrisma.user.findMany.mockResolvedValue([
            {
                id: 'user-2',
                username: 'misty',
                firstName: 'Misty',
                lastName: 'Waterflower'
            }
        ])

        const request = jsonRequest(
            'http://localhost/api/get-searchable-users',
            'POST',
            {},
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.users).toHaveLength(1)
        expect(body.users[0].id).toBe('user-2')
        expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    id: { not: 'user-1' },
                    visibility: 'public'
                })
            })
        )
    })
})
