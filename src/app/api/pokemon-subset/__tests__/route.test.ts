/** @jest-environment node */

import { mockPrisma, resetApiMocks } from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

import { GET } from '../route'

describe('GET /api/pokemon-subset', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns subsets successfully', async () => {
        mockPrisma.subset.findMany.mockResolvedValue([
            { id: 'sv1a', name: 'Subset A' }
        ])

        const response = await GET()
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body).toEqual([{ id: 'sv1a', name: 'Subset A' }])
    })

    it('returns 500 when prisma fails', async () => {
        mockPrisma.subset.findMany.mockRejectedValue(new Error('db fail'))

        const response = await GET()
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Failed to fetch subsets')
    })
})
