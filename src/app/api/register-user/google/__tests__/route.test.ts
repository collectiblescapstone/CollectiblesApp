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

describe('POST /api/register-user/google', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/register-user/google',
            'POST',
            { id: 'user-1-a', email: 'ash@example.com' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns exists status when user already exists', async () => {
        mockAuthSuccess('user-1-a')
        mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1-a' })

        const request = jsonRequest(
            'http://localhost/api/register-user/google',
            'POST',
            { id: 'user-1-a', email: 'ash@example.com' },
            authHeader('valid-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.status).toBe('exists')
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid token' }
        })

        const request = jsonRequest(
            'http://localhost/api/register-user/google',
            'POST',
            { id: 'user-1-a', email: 'ash@example.com' },
            authHeader('bad-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 401 when id mismatches authenticated user id', async () => {
        mockAuthSuccess('user-1-a')

        const request = jsonRequest(
            'http://localhost/api/register-user/google',
            'POST',
            { id: 'user-9-z', email: 'ash@example.com' },
            authHeader('valid-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - user ID mismatch')
    })

    it('returns 500 when database create throws', async () => {
        mockAuthSuccess('abc-def-ghi')
        mockPrisma.user.findUnique.mockResolvedValue(null)
        mockPrisma.user.create.mockRejectedValue(new Error('db fail'))

        const request = jsonRequest(
            'http://localhost/api/register-user/google',
            'POST',
            { id: 'abc-def-ghi', email: 'ash@example.com' },
            authHeader('valid-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Internal Server Error')
    })

    it('creates user and returns created status', async () => {
        mockAuthSuccess('abc-def-ghi')
        mockPrisma.user.findUnique.mockResolvedValue(null)
        mockPrisma.user.create.mockResolvedValue({ id: 'abc-def-ghi' })

        const request = jsonRequest(
            'http://localhost/api/register-user/google',
            'POST',
            { id: 'abc-def-ghi', email: 'ash@example.com' },
            authHeader('valid-token')
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.status).toBe('created')
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
            data: {
                id: 'abc-def-ghi',
                email: 'ash@example.com',
                username: 'ash_ghi'
            }
        })
    })
})
