/** @jest-environment node */

import {
    authHeader,
    jsonRequest,
    mockAuthSuccess,
    mockSupabase,
    mockSupabaseAdmin,
    resetApiMocks
} from '@/utils/testing-utils'

jest.mock('@/lib/supabase', () => ({
    __esModule: true,
    supabase: mockSupabase
}))

jest.mock('@/lib/supabaseAdmin', () => ({
    __esModule: true,
    supabaseAdmin: mockSupabaseAdmin
}))

import { POST } from '../route'

describe('POST /api/cleanup-failed-auth', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/cleanup-failed-auth',
            'POST',
            { userId: 'user-1' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 403 when auth user and payload user mismatch', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/cleanup-failed-auth',
            'POST',
            { userId: 'user-2' },
            authHeader('valid-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(403)
        expect(body.error).toBe('Unauthorized - cannot delete other users')
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid token' }
        })

        const request = jsonRequest(
            'http://localhost/api/cleanup-failed-auth',
            'POST',
            { userId: 'user-1' },
            authHeader('bad-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 400 when userId is missing', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/cleanup-failed-auth',
            'POST',
            {},
            authHeader('valid-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('User ID is required')
    })

    it('returns 500 when admin delete fails', async () => {
        mockAuthSuccess('user-1')
        mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
            error: { message: 'cannot delete user' }
        })

        const request = jsonRequest(
            'http://localhost/api/cleanup-failed-auth',
            'POST',
            { userId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Failed to delete auth user')
    })

    it('returns 200 when auth user is deleted successfully', async () => {
        mockAuthSuccess('user-1')
        mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
            error: null
        })

        const request = jsonRequest(
            'http://localhost/api/cleanup-failed-auth',
            'POST',
            { userId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Auth user deleted successfully')
        expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith(
            'user-1'
        )
    })
})
