/** @jest-environment node */

import { jsonRequest, mockPrisma, resetApiMocks } from '@/utils/testing-utils'

jest.mock('@/lib/prisma', () => ({
    __esModule: true,
    default: mockPrisma
}))

import { POST } from '../route'

describe('POST /api/pokemon-card', () => {
    beforeEach(() => {
        resetApiMocks()
    })

    it('returns cards filtered by ids', async () => {
        mockPrisma.card.findMany.mockResolvedValue([
            { id: 'sv1-1', name: 'Bulbasaur' }
        ])

        const request = jsonRequest(
            'http://localhost/api/pokemon-card',
            'POST',
            {
                ids: ['sv1-1']
            }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body).toEqual([{ id: 'sv1-1', name: 'Bulbasaur' }])
        expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: { in: ['sv1-1'] } }
            })
        )
    })

    it('returns all cards when ids are not provided', async () => {
        mockPrisma.card.findMany.mockResolvedValue([
            { id: 'sv1-1', name: 'Bulbasaur' }
        ])

        const request = jsonRequest(
            'http://localhost/api/pokemon-card',
            'POST',
            {}
        )
        const response = await POST(request)

        expect(response.status).toBe(200)
        expect(mockPrisma.card.findMany).toHaveBeenCalledWith(
            expect.not.objectContaining({ where: expect.anything() })
        )
    })

    it('returns 500 when prisma throws', async () => {
        mockPrisma.card.findMany.mockRejectedValue(new Error('db fail'))

        const request = jsonRequest(
            'http://localhost/api/pokemon-card',
            'POST',
            {
                ids: ['sv1-1']
            }
        )
        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Failed to fetch specified cards')
    })
})
