/** @jest-environment node */

import {
    authHeader,
    createTxMock,
    mockAuthSuccess,
    mockPrisma,
    mockSupabase,
    mockSupabaseAdmin,
    resetApiMocks,
    runTransactionWith
} from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

jest.mock('@/lib/supabase', () => ({
    __esModule: true,
    supabase: mockSupabase
}))

jest.mock('@/lib/supabaseAdmin', () => ({
    __esModule: true,
    supabaseAdmin: mockSupabaseAdmin
}))

import { DELETE } from '../route'

describe('DELETE /api/delete-account', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when bearer token is missing', async () => {
        const request = new Request('http://localhost/api/delete-account', {
            method: 'DELETE'
        })

        const response = await DELETE(request)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('deletes user data and auth account when authorized', async () => {
        mockAuthSuccess('user-1')

        const tx = createTxMock()
        runTransactionWith(tx)

        mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
            error: null
        })

        const request = new Request('http://localhost/api/delete-account', {
            method: 'DELETE',
            headers: authHeader('valid-token')
        })

        const response = await DELETE(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Account deleted successfully')

        expect(tx.collectionEntry.deleteMany).toHaveBeenCalledWith({
            where: { userId: 'user-1' }
        })
        expect(tx.wishlistEntry.deleteMany).toHaveBeenCalledWith({
            where: { userId: 'user-1' }
        })
        expect(tx.user.delete).toHaveBeenCalledWith({
            where: { id: 'user-1' }
        })
        expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith(
            'user-1'
        )
    })

    it('returns 500 when transaction fails', async () => {
        mockAuthSuccess('user-1')

        mockPrisma.$transaction.mockRejectedValue(new Error('db failed'))

        const request = new Request('http://localhost/api/delete-account', {
            method: 'DELETE',
            headers: authHeader('valid-token')
        })

        const response = await DELETE(request)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Internal Server Error')
        expect(mockSupabaseAdmin.auth.admin.deleteUser).not.toHaveBeenCalled()
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid token' }
        })

        const request = new Request('http://localhost/api/delete-account', {
            method: 'DELETE',
            headers: authHeader('bad-token')
        })

        const response = await DELETE(request)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 200 even when auth delete fails after db delete', async () => {
        mockAuthSuccess('user-1')
        const tx = createTxMock()
        runTransactionWith(tx)
        mockSupabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
            error: { message: 'auth delete failed' }
        })

        const request = new Request('http://localhost/api/delete-account', {
            method: 'DELETE',
            headers: authHeader('valid-token')
        })

        const response = await DELETE(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('Account deleted successfully')
    })
})
