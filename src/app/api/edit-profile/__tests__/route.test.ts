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

import { PATCH } from '../route'

describe('PATCH /api/edit-profile', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/edit-profile',
            'PATCH',
            {
                id: 'user-1'
            }
        )

        const response = await PATCH(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 403 when request user id does not match auth user', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/edit-profile',
            'PATCH',
            { id: 'user-2', firstName: 'Misty' },
            authHeader('valid-token')
        )

        const response = await PATCH(request as any)
        const body = await response.json()

        expect(response.status).toBe(403)
        expect(body.error).toBe('Forbidden')
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid' }
        })

        const request = jsonRequest(
            'http://localhost/api/edit-profile',
            'PATCH',
            { id: 'user-1' },
            authHeader('bad-token')
        )

        const response = await PATCH(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 400 when identifier is missing', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/edit-profile',
            'PATCH',
            { firstName: 'Ash' },
            authHeader('valid-token')
        )

        const response = await PATCH(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Missing identifier (id)')
    })

    it('returns 500 when prisma update throws', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.user.update.mockRejectedValue(new Error('db fail'))

        const request = jsonRequest(
            'http://localhost/api/edit-profile',
            'PATCH',
            { id: 'user-1', firstName: 'Ash' },
            authHeader('valid-token')
        )

        const response = await PATCH(request as any)

        expect(response.status).toBe(500)
    })

    it('returns updated user when payload is valid', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.user.update.mockResolvedValue({
            id: 'user-1',
            firstName: 'Ash',
            visibility: 'public'
        })

        const request = jsonRequest(
            'http://localhost/api/edit-profile',
            'PATCH',
            { id: 'user-1', firstName: 'Ash', visibility: 'public' },
            authHeader('valid-token')
        )

        const response = await PATCH(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.success).toBe(true)
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: expect.objectContaining({
                firstName: 'Ash',
                visibility: 'public'
            })
        })
    })

    it('maps nullable and optional fields into update payload', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.user.update.mockResolvedValue({ id: 'user-1' })

        const request = jsonRequest(
            'http://localhost/api/edit-profile',
            'PATCH',
            {
                id: 'user-1',
                firstName: 'Ash',
                lastName: 'Ketchum',
                username: 'ash',
                bio: 'Trainer',
                location: 'Pallet',
                latitude: null,
                longitude: null,
                instagram: 'ig',
                x: 'x',
                facebook: 'fb',
                whatsapp: 'wa',
                discord: 'disc',
                profilePic: 4,
                visibility: 'public'
            },
            authHeader('valid-token')
        )

        const response = await PATCH(request as any)

        expect(response.status).toBe(200)
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: {
                firstName: 'Ash',
                lastName: 'Ketchum',
                username: 'ash',
                bio: 'Trainer',
                location: 'Pallet',
                latitude: null,
                longitude: null,
                instagram: 'ig',
                x: 'x',
                facebook: 'fb',
                whatsapp: 'wa',
                discord: 'disc',
                profile_pic: 4,
                visibility: 'public'
            }
        })
    })
})
