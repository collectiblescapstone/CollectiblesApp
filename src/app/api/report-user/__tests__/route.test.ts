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

const basePayload = {
    reqUserId: 'user-1',
    reportedUserId: 'user-2',
    isVerbalAbuse: true,
    isSpamming: false,
    isHarassment: false,
    isScamming: false,
    isBadName: false,
    isBadBio: false,
    reason: 'This is a valid report reason.'
}

describe('POST /api/report-user', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns 401 when token is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/report-user',
            'POST',
            basePayload
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - missing token')
    })

    it('returns 400 when payload has no selected report types', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/report-user',
            'POST',
            {
                ...basePayload,
                isVerbalAbuse: false,
                reason: 'Valid reason text'
            },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toContain('Please select at least one report type')
    })

    it('returns 401 when token is invalid', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'invalid token' }
        })

        const request = jsonRequest(
            'http://localhost/api/report-user',
            'POST',
            basePayload,
            authHeader('bad-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - invalid token')
    })

    it('returns 401 when reqUserId mismatches auth user', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/report-user',
            'POST',
            { ...basePayload, reqUserId: 'user-9' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(401)
        expect(body.error).toBe('Unauthorized - user ID mismatch')
    })

    it('returns 400 when user reports themselves', async () => {
        mockAuthSuccess('user-1')

        const request = jsonRequest(
            'http://localhost/api/report-user',
            'POST',
            { ...basePayload, reportedUserId: 'user-1' },
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Users cannot report themselves')
    })

    it('returns 400 when report was already submitted within 72 hours', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.reportedUser.findFirst.mockResolvedValue({
            createdAt: new Date(Date.now() - 1000 * 60 * 60)
        })

        const request = jsonRequest(
            'http://localhost/api/report-user',
            'POST',
            basePayload,
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toContain('You have already reported this user')
    })

    it('returns 500 when prisma throws', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.reportedUser.findFirst.mockRejectedValue(
            new Error('db fail')
        )

        const request = jsonRequest(
            'http://localhost/api/report-user',
            'POST',
            basePayload,
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Internal Server Error')
    })

    it('returns 200 when report is created successfully', async () => {
        mockAuthSuccess('user-1')
        mockPrisma.reportedUser.findFirst.mockResolvedValue(null)
        mockPrisma.reportedUser.create.mockResolvedValue({ id: 1 })

        const request = jsonRequest(
            'http://localhost/api/report-user',
            'POST',
            basePayload,
            authHeader('valid-token')
        )

        const response = await POST(request as any)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.message).toBe('User reported successfully')
        expect(mockPrisma.reportedUser.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                reporterId: 'user-1',
                reportedUserId: 'user-2',
                reason: basePayload.reason
            })
        })
    })
})
