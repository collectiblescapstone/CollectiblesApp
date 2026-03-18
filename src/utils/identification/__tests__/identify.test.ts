import { IdentifyCardInImage } from '../identify'
import { rotation } from '@/types/identification'

const mockLocateWithYOLO = jest.fn()
const mockCardClassifierFactory = jest.fn()
const mockClassifier = jest.fn()

jest.mock('../locateWithYOLO', () => ({
    locateWithYOLO: (...args: unknown[]) => mockLocateWithYOLO(...args)
}))

jest.mock('../classifyNormalizedCard', () => ({
    CardClassifier: (...args: unknown[]) => mockCardClassifierFactory(...args)
}))

jest.mock('@techstark/opencv-js', () => ({
    __esModule: true,
    default: Promise.resolve({ mocked: true })
}))

describe('IdentifyCardInImage', () => {
    const originalImage = global.Image
    const originalCreateElement = document.createElement

    const drawImage = jest.fn()
    const getImageData = jest.fn(() => ({ pixels: true }))

    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()

        mockCardClassifierFactory.mockResolvedValue(mockClassifier)

        class MockImage {
            width = 320
            height = 240
            crossOrigin = ''
            private _onload: (() => void) | null = null
            private _src = ''

            set onload(value: (() => void) | null) {
                this._onload = value
                if (this._src && this._onload) {
                    this._onload()
                }
            }

            get onload() {
                return this._onload
            }

            set src(value: string) {
                this._src = value
                if (this._onload) {
                    this._onload()
                }
            }
        }

        Object.defineProperty(global, 'Image', {
            writable: true,
            value: MockImage
        })

        const mockCanvas = {
            width: 0,
            height: 0,
            getContext: jest.fn(() => ({ drawImage, getImageData }))
        } as unknown as HTMLCanvasElement

        document.createElement = jest
            .fn()
            .mockImplementation((tagName: string) => {
                if (tagName === 'canvas') {
                    return mockCanvas
                }

                return originalCreateElement.call(document, tagName)
            })
    })

    afterAll(() => {
        Object.defineProperty(global, 'Image', {
            writable: true,
            value: originalImage
        })
        document.createElement = originalCreateElement
    })

    it('returns undefined when no card image is detected', async () => {
        mockLocateWithYOLO.mockResolvedValue({ results: [] })

        const result = await IdentifyCardInImage('https://img')

        expect(result).toBeUndefined()
        expect(mockCardClassifierFactory).not.toHaveBeenCalled()
    })

    it('classifies first card and cleans up only non-deleted mats', async () => {
        const imageA = { isDeleted: jest.fn(() => false), delete: jest.fn() }
        const imageB = { isDeleted: jest.fn(() => true), delete: jest.fn() }

        const located = {
            image: imageA,
            corners: [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1]
            ]
        }

        mockLocateWithYOLO.mockResolvedValue({
            results: [located, { image: imageB }]
        })

        const predicted = { card: { id: 'sv1-1' } }
        mockClassifier.mockReturnValue([predicted])

        const result = await IdentifyCardInImage('https://img')

        expect(drawImage).toHaveBeenCalledTimes(1)
        expect(getImageData).toHaveBeenCalledWith(0, 0, 320, 240)
        expect(mockLocateWithYOLO).toHaveBeenCalledWith(
            { pixels: true },
            expect.any(Object),
            false
        )
        expect(mockCardClassifierFactory).toHaveBeenCalledTimes(1)
        expect(mockClassifier).toHaveBeenCalledWith(expect.any(Object), imageA)

        expect(imageA.delete).toHaveBeenCalledTimes(1)
        expect(imageB.delete).not.toHaveBeenCalled()

        expect(result).toEqual({
            predictedCard: predicted,
            foundCardImage: imageA,
            corners: located.corners
        })
    })

    it('skips linter log when rotation is non-zero', async () => {
        mockLocateWithYOLO.mockResolvedValue({ results: [] })
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

        await IdentifyCardInImage('https://img', rotation.CLOCKWISE)

        expect(logSpy).not.toHaveBeenCalled()
        logSpy.mockRestore()
    })
})
