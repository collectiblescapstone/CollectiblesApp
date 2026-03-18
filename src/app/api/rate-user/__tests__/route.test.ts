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

describe('POST /api/rate-user', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when token is missing', async () => {
        const request = jsonRequest('http://localhost/api/rate-user', 'POST', {
            username: 'misty',
            rating: 4,
            currentUserId: 'user-1'
        })

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 400 when rating is invalid', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/rate-user',
            'POST',
            { username: 'misty', rating: 4.3, currentUserId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Invalid values provided')
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid token' }
        })

        const request = jsonRequest(
            'http://localhost/api/rate-user',
            'POST',
            { username: 'misty', rating: 4, currentUserId: 'user-1' },
            authHeader('bad-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 403 when currentUserId mismatches auth user', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/rate-user',
            'POST',
            { username: 'misty', rating: 4, currentUserId: 'user-9' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(403)
        expect(body.error).toBe('Forbidden')
    })

    it('returns 404 when target user does not exist', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.user.findUnique.mockResolvedValue(null)

        const request = jsonRequest(
            'http://localhost/api/rate-user',
            'POST',
            { username: 'misty', rating: 4, currentUserId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(404)
        expect(body.error).toBe('User not found')
    })

    it('returns 400 when user tries to rate themselves', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            rating: 4,
            rating_count: 2
        })

        const request = jsonRequest(
            'http://localhost/api/rate-user',
            'POST',
            { username: 'ash', rating: 4, currentUserId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Users cannot rate themselves')
    })

    it('returns 200 and updates rating on success', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-2',
            rating: 4,
            rating_count: 2
        })
        mockPrisma.user.update.mockResolvedValue({ id: 'user-2' })

        const request = jsonRequest(
            'http://localhost/api/rate-user',
            'POST',
            { username: 'misty', rating: 5, currentUserId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Rating submitted successfully')
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-2' },
            data: {
                rating: (4 * 2 + 5) / 3,
                rating_count: 3
            }
        })
    })
})
