const mockFilterContours = jest.fn()
const mockReorderCorners = jest.fn()
const mockProcessONNXSessionResults = jest.fn()
const mockLoadModel = jest.fn()

jest.mock('../cvutils', () => ({
    filterContours: (...args: unknown[]) => mockFilterContours(...args),
    reorderCorners: (...args: unknown[]) => mockReorderCorners(...args)
}))

jest.mock('../YOLOONNXUtils', () => ({
    processONNXSessionResults: (...args: unknown[]) =>
        mockProcessONNXSessionResults(...args)
}))

jest.mock('../loadModel', () => ({
    loadModel: (...args: unknown[]) => mockLoadModel(...args)
}))

jest.mock('onnxruntime-web', () => ({
    Tensor: class MockTensor {
        type: string
        data: Float32Array
        dims: number[]
        dispose = jest.fn()
        constructor(type: string, data: Float32Array, dims: number[]) {
            this.type = type
            this.data = data
            this.dims = dims
        }
    }
}))

describe('locateWithYOLO', () => {
    class MockMat {
        rows = 1
        deleted = false
        data = { set: jest.fn() }
        data32F = new Float32Array([1, 2, 3])
        constructor(
            _rows?: number,
            _cols?: number,
            _type?: number,
            _scalar?: any
        ) {}
        delete() {
            this.deleted = true
        }
        isDeleted() {
            return this.deleted
        }
        static zeros() {
            return new MockMat()
        }
    }

    class MockMatVector {
        private deleted = false
        delete() {
            this.deleted = true
        }
        isDeleted() {
            return this.deleted
        }
    }

    const createCV = () => {
        const cv: any = {
            CV_8UC4: 1,
            CV_8UC3: 2,
            CV_32FC2: 3,
            COLOR_RGBA2RGB: 4,
            COLOR_RGBA2GRAY: 5,
            RETR_EXTERNAL: 6,
            CHAIN_APPROX_SIMPLE: 7,
            Mat: MockMat,
            MatVector: MockMatVector,
            Size: jest.fn((w: number, h: number) => ({ width: w, height: h })),
            resize: jest.fn(),
            cvtColor: jest.fn(),
            blobFromImage: jest.fn(() => ({
                data32F: new Float32Array([1, 2, 3]),
                delete: jest.fn()
            })),
            findContours: jest.fn(),
            matFromArray: jest.fn(() => new MockMat()),
            getPerspectiveTransform: jest.fn(() => new MockMat()),
            warpPerspective: jest.fn()
        }
        return cv
    }

    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()
    })

    it('returns normalized cards and overlay on success', async () => {
        const { locateWithYOLO } = await import('../locateWithYOLO')
        const cv = createCV()

        const contour = new MockMat()
        mockFilterContours.mockReturnValue([contour])
        mockReorderCorners.mockReturnValue([
            [10, 10],
            [50, 10],
            [10, 80],
            [50, 80]
        ])

        const masksMat = new MockMat()
        mockProcessONNXSessionResults.mockReturnValue({
            results: [{}],
            masksMat
        })

        const detections = { dispose: jest.fn() }
        const proto = { dispose: jest.fn() }
        const session = {
            outputNames: ['det', 'proto'],
            run: jest.fn().mockResolvedValue({ det: detections, proto })
        }
        mockLoadModel.mockResolvedValue(session)

        const imageData = {
            width: 100,
            height: 100,
            data: new Uint8ClampedArray(100 * 100 * 4)
        } as ImageData

        const getImageData = jest.fn(() => ({ overlay: true }))
        const ctx = {
            strokeStyle: '',
            lineWidth: 0,
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            closePath: jest.fn(),
            stroke: jest.fn(),
            getImageData
        }
        const canvas = {
            width: 0,
            height: 0,
            getContext: jest.fn(() => ctx)
        }
        const originalCreateElement = document.createElement
        document.createElement = jest.fn((tag: string) => {
            if (tag === 'canvas') {
                return canvas as any
            }
            return originalCreateElement.call(document, tag)
        })

        const result = await locateWithYOLO(imageData, cv)

        expect(result).toEqual({
            results: [
                {
                    image: expect.any(Object),
                    corners: [
                        [1.5625, 1.5625],
                        [7.8125, 1.5625],
                        [1.5625, 12.5],
                        [7.8125, 12.5]
                    ]
                }
            ],
            overlay: { overlay: true }
        })

        expect(mockLoadModel).toHaveBeenCalledWith('/models/card_yolo.onnx')
        expect(session.run).toHaveBeenCalledTimes(1)
        expect(mockFilterContours).toHaveBeenCalledTimes(1)
        expect(detections.dispose).toHaveBeenCalledTimes(1)
        expect(proto.dispose).toHaveBeenCalledTimes(1)

        document.createElement = originalCreateElement
    })

    it('returns null when post-processing has no usable results', async () => {
        const { locateWithYOLO } = await import('../locateWithYOLO')
        const cv = createCV()

        mockProcessONNXSessionResults.mockReturnValue({
            results: [],
            masksMat: null
        })

        const detections = { dispose: jest.fn() }
        const proto = { dispose: jest.fn() }
        mockLoadModel.mockResolvedValue({
            outputNames: ['det', 'proto'],
            run: jest.fn().mockResolvedValue({ det: detections, proto })
        })

        const imageData = {
            width: 100,
            height: 100,
            data: new Uint8ClampedArray(100 * 100 * 4)
        } as ImageData

        const result = await locateWithYOLO(imageData, cv, true)
        expect(result).toBeNull()
        expect(detections.dispose).toHaveBeenCalledTimes(1)
        expect(proto.dispose).toHaveBeenCalledTimes(1)
    })

    it('increments errors and eventually short-circuits after repeated failures', async () => {
        const { locateWithYOLO } = await import('../locateWithYOLO')
        const cv = createCV()
        cv.resize = jest.fn(() => {
            throw new Error('resize-failed')
        })

        const errorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => undefined)
        const warnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(() => undefined)

        const imageData = {
            width: 100,
            height: 100,
            data: new Uint8ClampedArray(100 * 100 * 4)
        } as ImageData

        for (let i = 0; i < 5; i++) {
            await expect(locateWithYOLO(imageData, cv)).resolves.toBeNull()
        }

        await expect(locateWithYOLO(imageData, cv)).resolves.toBeNull()
        expect(warnSpy).toHaveBeenCalledWith(
            'Too many errors in locateWithYOLO, skipping processing.'
        )
        expect(errorSpy).toHaveBeenCalled()

        errorSpy.mockRestore()
        warnSpy.mockRestore()
    })
})
