/** @jest-environment node */

import {
    jsonRequest,
    mockPrisma,
    mockSupabaseAdmin,
    resetApiMocks
} from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

jest.mock('@/lib/supabaseAdmin', () => ({
    __esModule: true,
    supabaseAdmin: mockSupabaseAdmin
}))

import { POST } from '../route'

const payload = {
    id: 'user-1',
    email: 'ash@example.com',
    username: 'ash',
    firstName: 'Ash',
    lastName: 'Ketchum'
}

describe('POST /api/register-user', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 404 when user does not exist in Supabase Auth', async () => {
        mockSupabaseAdmin.auth.admin.getUserById.mockResolvedValue({
            data: null
        })

        const request = jsonRequest(
            'http://localhost/api/register-user',
            'POST',
            payload
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(404)
        expect(body.error).toBe('User not found in Supabase Auth')
        expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('creates user and returns 200 when Supabase user exists', async () => {
        mockSupabaseAdmin.auth.admin.getUserById.mockResolvedValue({
            data: { user: { id: 'user-1' } }
        })
        mockPrisma.user.create.mockResolvedValue({ id: 'user-1' })

        const request = jsonRequest(
            'http://localhost/api/register-user',
            'POST',
            payload
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('User registered successfully')
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
            data: payload
        })
    })

    it('rolls back and returns 500 when create fails', async () => {
        mockSupabaseAdmin.auth.admin.getUserById.mockResolvedValue({
            data: { user: { id: 'user-1' } }
        })
        mockPrisma.user.create.mockRejectedValue(new Error('create failed'))
        mockPrisma.user.delete.mockResolvedValue({ id: 'user-1' })
        mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
            data: { user: null },
            error: null
        })

        const request = jsonRequest(
            'http://localhost/api/register-user',
            'POST',
            payload
        )

        const response = await POST(request)

        expect(response.status).toBe(500)
        expect(mockPrisma.user.delete).toHaveBeenCalledWith({
            where: { id: payload.id, email: payload.email }
        })
        expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith(
            payload.id
        )
    })
})
