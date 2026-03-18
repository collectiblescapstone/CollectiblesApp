/** @jest-environment node */

import { jsonRequest, resetApiMocks } from '@/utils/testing-utils'
import { POST } from '../route'

describe('POST /api/get-location-predictions', () => {
    beforeEach(() => {
        resetApiMocks()
        ;(global.fetch as jest.Mock | undefined) = jest.fn()
    })

    it('returns 400 when query is too short', async () => {
        const request = jsonRequest(
            'http://localhost/api/get-location-predictions',
            'POST',
            { query: 'ab' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Query must be at least 3 characters')
    })

    it('returns predictions on successful fetch', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                features: [
                    {
                        properties: {
                            formatted: 'Pallet Town',
                            lat: 35.1,
                            lon: 139.2
                        }
                    }
                ]
            })
        })

        const request = jsonRequest(
            'http://localhost/api/get-location-predictions',
            'POST',
            { query: 'Pallet' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.predictions).toEqual([
            { formatted: 'Pallet Town', lat: 35.1, lon: 139.2 }
        ])
    })

    it('returns 500 when fetch fails', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: 'Bad Request'
        })

        const request = jsonRequest(
            'http://localhost/api/get-location-predictions',
            'POST',
            { query: 'Pallet' }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Failed to fetch location predictions')
    })
})
