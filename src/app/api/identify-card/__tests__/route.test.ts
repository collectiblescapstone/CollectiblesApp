/** @jest-environment node */

import { jsonRequest, resetApiMocks } from '@/utils/testing-utils'

jest.mock('sharp', () => ({
    __esModule: true,
    default: jest.fn(() => {
        const chain: {
            raw: jest.Mock
            ensureAlpha: jest.Mock
            toBuffer: jest.Mock
        } = {
            raw: jest.fn(),
            ensureAlpha: jest.fn(),
            toBuffer: jest.fn(async () => ({
                data: Buffer.from([0, 0, 0, 255]),
                info: { width: 1, height: 1 }
            }))
        }
        chain.raw.mockReturnValue(chain)
        chain.ensureAlpha.mockReturnValue(chain)
        return chain
    })
}))

jest.mock('@/utils/identification/server/locateWithYOLOServer', () => ({
    __esModule: true,
    locateWithYOLOServer: jest.fn()
}))

jest.mock('@/utils/identification/server/classifyNormalizedCardServer', () => ({
    __esModule: true,
    CardClassifierServer: jest.fn()
}))

jest.mock('@techstark/opencv-js', () => ({
    __esModule: true,
    default: Promise.resolve({})
}))

import { POST } from '../route'
import { locateWithYOLOServer } from '@/utils/identification/server/locateWithYOLOServer'
import { CardClassifierServer } from '@/utils/identification/server/classifyNormalizedCardServer'

const mockLocateWithYOLOServer = locateWithYOLOServer as jest.Mock
const mockCardClassifierServer = CardClassifierServer as jest.Mock

describe('POST /api/identify-card', () => {
    beforeEach(() => {
        resetApiMocks()
        mockLocateWithYOLOServer.mockResolvedValue({ results: [] })
        mockCardClassifierServer.mockResolvedValue(jest.fn(() => []))
    })

    it('returns 400 when imageDataUrl is missing', async () => {
        const request = jsonRequest(
            'http://localhost/api/identify-card',
            'POST',
            {}
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Missing imageDataUrl in request body')
    })

    it('returns 400 when imageDataUrl format is invalid', async () => {
        const request = jsonRequest(
            'http://localhost/api/identify-card',
            'POST',
            {
                imageDataUrl: 'not-a-data-url'
            }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Invalid imageDataUrl format')
    })

    it('returns predicted cards on success', async () => {
        const fakeImage = { isDeleted: () => false, delete: jest.fn() }
        mockLocateWithYOLOServer.mockResolvedValue({
            results: [{ image: fakeImage }]
        })
        mockCardClassifierServer.mockResolvedValue(() => [
            { card: { image: 'https://img/card' } }
        ])

        const request = jsonRequest(
            'http://localhost/api/identify-card',
            'POST',
            {
                imageDataUrl: 'data:image/png;base64,AA=='
            }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.predictedCards).toHaveLength(1)
        expect(body.predictedCards[0].imageURL).toBe('https://img/card/low.jpg')
        expect(fakeImage.delete).toHaveBeenCalled()
    })

    it('returns 200 with empty predictions when no cards match', async () => {
        mockLocateWithYOLOServer.mockResolvedValue({
            results: [{ image: { isDeleted: () => true, delete: jest.fn() } }]
        })
        mockCardClassifierServer.mockResolvedValue(() => [])

        const request = jsonRequest(
            'http://localhost/api/identify-card',
            'POST',
            {
                imageDataUrl: 'data:image/png;base64,AA=='
            }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.predictedCards).toEqual([])
    })

    it('returns 500 when processing throws', async () => {
        mockLocateWithYOLOServer.mockRejectedValue(new Error('processing fail'))

        const request = jsonRequest(
            'http://localhost/api/identify-card',
            'POST',
            {
                imageDataUrl: 'data:image/png;base64,AA=='
            }
        )

        const response = await POST(request)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.error).toBe('Failed to identify cards')
    })
})
