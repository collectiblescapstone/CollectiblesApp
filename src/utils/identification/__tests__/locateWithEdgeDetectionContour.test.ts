export {}

const mockBiggestContour = jest.fn()
const mockReorderCorners = jest.fn()

jest.mock('../cvutils', () => ({
    biggestContour: (...args: unknown[]) => mockBiggestContour(...args),
    reorderCorners: (...args: unknown[]) => mockReorderCorners(...args)
}))

const cv: any = {}

jest.mock('@techstark/opencv-js', () => ({
    __esModule: true,
    default: Promise.resolve(cv)
}))

describe('locateWithEdgeDetectionContour', () => {
    class MockMat {
        rows: number
        deleted = false
        constructor(rows = 0) {
            this.rows = rows
        }
        copyTo = jest.fn()
        delete = jest.fn(() => {
            this.deleted = true
        })
    }

    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()

        cv.ROTATE_90_CLOCKWISE = 1
        cv.ROTATE_90_COUNTERCLOCKWISE = 2
        cv.ROTATE_180 = 3
        cv.COLOR_RGBA2RGB = 4
        cv.COLOR_RGB2GRAY = 5
        cv.CV_8U = 6
        cv.CV_8UC3 = 7
        cv.CV_32FC2 = 8
        cv.RETR_EXTERNAL = 9
        cv.CHAIN_APPROX_SIMPLE = 10

        cv.Mat = MockMat
        cv.MatVector = jest.fn(() => ({ size: () => 0, delete: jest.fn() }))
        cv.Size = jest.fn((w: number, h: number) => ({ w, h }))
        cv.Mat.ones = jest.fn(() => new MockMat())
        cv.Mat.zeros = jest.fn(() => new MockMat())
        cv.rotate = jest.fn()
        cv.cvtColor = jest.fn()
        cv.GaussianBlur = jest.fn()
        cv.Canny = jest.fn()
        cv.dilate = jest.fn()
        cv.erode = jest.fn()
        cv.findContours = jest.fn()
        cv.matFromArray = jest.fn(() => new MockMat())
        cv.getPerspectiveTransform = jest.fn(() => new MockMat())
        cv.warpPerspective = jest.fn()
    })

    it('returns undefined when no contours are found', async () => {
        const contours = { size: () => 0, delete: jest.fn() }
        cv.MatVector = jest.fn(() => contours)

        const { locateWithEdgeDetectionContour } =
            await import('../locateWithEdgeDetectionContour')
        const input = new MockMat()

        const result = await locateWithEdgeDetectionContour(input as any)

        expect(result).toBeUndefined()
        expect(contours.delete).toHaveBeenCalledTimes(1)
    })

    it('rotates and returns warped card for valid 4-corner contour', async () => {
        const contours = { size: () => 1, delete: jest.fn() }
        const hierarchy = new MockMat()
        cv.MatVector = jest.fn(() => contours)
        cv.Mat = jest.fn(() => hierarchy)
        cv.Mat.ones = jest.fn(() => new MockMat())
        cv.Mat.zeros = jest.fn(() => new MockMat())

        const cornerMat = new MockMat(4)
        ;(cornerMat as any).delete = jest.fn()
        mockBiggestContour.mockReturnValue({ biggest: cornerMat })
        mockReorderCorners.mockReturnValue([
            [1, 1],
            [5, 1],
            [1, 8],
            [5, 8]
        ])

        const { locateWithEdgeDetectionContour } =
            await import('../locateWithEdgeDetectionContour')
        const { rotation } = await import('@/types/identification')

        const src = new MockMat()
        const result = await locateWithEdgeDetectionContour(
            src as any,
            rotation.CLOCKWISE
        )

        expect(cv.rotate).toHaveBeenCalledWith(src, src, cv.ROTATE_90_CLOCKWISE)
        expect(cv.getPerspectiveTransform).toHaveBeenCalled()
        expect(cv.warpPerspective).toHaveBeenCalled()
        expect(result).toEqual({
            image: expect.any(Object),
            corners: [
                [1, 1],
                [5, 1],
                [1, 8],
                [5, 8]
            ]
        })
    })
})
