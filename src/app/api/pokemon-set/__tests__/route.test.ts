/** @jest-environment node */

import { mockPrisma, resetApiMocks } from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

import { GET } from '../route'

describe('GET /api/pokemon-set', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns sets successfully', async () => {
        mockPrisma.set.findMany.mockResolvedValue([
            { id: 'sv1', name: 'SV Base' }
        ])

        const response = await GET()
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body).toEqual([{ id: 'sv1', name: 'SV Base' }])
    })

    it('returns 500 when prisma fails', async () => {
        mockPrisma.set.findMany.mockRejectedValue(new Error('db fail'))

        const response = await GET()
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Failed to fetch sets')
    })
})
