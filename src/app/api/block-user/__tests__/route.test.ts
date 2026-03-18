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

describe('POST /api/block-user', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when token is missing', async () => {
        const request = jsonRequest('http://localhost/api/block-user', 'POST', {
            userId: 'user-1',
            blockedUserId: 'user-2'
        })

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 400 when user tries to block themselves', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/block-user',
            'POST',
            { userId: 'user-1', blockedUserId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Users cannot block themselves')
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid' }
        })

        const request = jsonRequest(
            'http://localhost/api/block-user',
            'POST',
            { userId: 'user-1', blockedUserId: 'user-2' },
            authHeader('bad-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 401 when body user id mismatches auth user', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/block-user',
            'POST',
            { userId: 'user-9', blockedUserId: 'user-2' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - user ID mismatch')
    })

    it('returns 400 when user is already blocked', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.blockList.findUnique.mockResolvedValue({ id: 1 })

        const request = jsonRequest(
            'http://localhost/api/block-user',
            'POST',
            { userId: 'user-1', blockedUserId: 'user-2' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('User is already blocked')
        expect(mockPrisma.blockList.create).not.toHaveBeenCalled()
    })

    it('returns 500 when prisma throws', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.blockList.findUnique.mockRejectedValue(new Error('db fail'))

        const request = jsonRequest(
            'http://localhost/api/block-user',
            'POST',
            { userId: 'user-1', blockedUserId: 'user-2' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Internal Server Error')
    })

    it('returns 200 when user is blocked successfully', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.blockList.findUnique.mockResolvedValue(null)
        mockPrisma.blockList.create.mockResolvedValue({
            userId: 'user-1',
            blockedUserId: 'user-2'
        })

        const request = jsonRequest(
            'http://localhost/api/block-user',
            'POST',
            { userId: 'user-1', blockedUserId: 'user-2' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('User blocked successfully')
        expect(mockPrisma.blockList.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-1',
                blockedUserId: 'user-2'
            }
        })
    })
})
