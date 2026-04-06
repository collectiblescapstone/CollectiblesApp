export {}

const mockFilterContours = jest.fn()
const mockReorderCorners = jest.fn()
const mockProcessONNXSessionResultsServer = jest.fn()
const mockLoadModelServer = jest.fn()

jest.mock('../../cvutils', () => ({
    filterContours: (...args: unknown[]) => mockFilterContours(...args),
    reorderCorners: (...args: unknown[]) => mockReorderCorners(...args)
}))

jest.mock('../YOLOONNXUtilsServer', () => ({
    processONNXSessionResultsServer: (...args: unknown[]) =>
        mockProcessONNXSessionResultsServer(...args)
}))

jest.mock('../loadModelServer', () => ({
    loadModelServer: (...args: unknown[]) => mockLoadModelServer(...args)
}))

jest.mock('onnxruntime-node', () => ({
    Tensor: class MockTensor {
        dispose = jest.fn()
        constructor(_type: string, _data: Float32Array, _dims: number[]) {}
    }
}))

describe('locateWithYOLOServer', () => {
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
        return {
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
        } as any
    }

    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()
    })

    it('returns normalized cards on success', async () => {
        const { locateWithYOLOServer } = await import('../locateWithYOLOServer')
        const cv = createCV()

        mockFilterContours.mockReturnValue([new MockMat()])
        mockReorderCorners.mockReturnValue([
            [10, 10],
            [50, 10],
            [10, 80],
            [50, 80]
        ])
        mockProcessONNXSessionResultsServer.mockReturnValue({
            results: [{}],
            masksMat: new MockMat()
        })

        const detections = { dispose: jest.fn() }
        const proto = { dispose: jest.fn() }
        mockLoadModelServer.mockResolvedValue({
            outputNames: ['det', 'proto'],
            run: jest.fn().mockResolvedValue({ det: detections, proto })
        })

        const imageData = {
            width: 100,
            height: 100,
            data: new Uint8ClampedArray(100 * 100 * 4)
        } as ImageData

        const result = await locateWithYOLOServer(imageData, cv)

        expect(result).toEqual({
            results: [
                {
                    image: expect.any(Object),
                    corners: [
                        [3.125, 3.125],
                        [15.625, 3.125],
                        [3.125, 25],
                        [15.625, 25]
                    ]
                }
            ]
        })
        expect(detections.dispose).toHaveBeenCalledTimes(1)
        expect(proto.dispose).toHaveBeenCalledTimes(1)
    })

    it('returns null on empty post-process results', async () => {
        const { locateWithYOLOServer } = await import('../locateWithYOLOServer')
        const cv = createCV()

        mockProcessONNXSessionResultsServer.mockReturnValue({
            results: [],
            masksMat: null
        })
        mockLoadModelServer.mockResolvedValue({
            outputNames: ['det', 'proto'],
            run: jest.fn().mockResolvedValue({
                det: { dispose: jest.fn() },
                proto: { dispose: jest.fn() }
            })
        })

        const imageData = {
            width: 100,
            height: 100,
            data: new Uint8ClampedArray(100 * 100 * 4)
        } as ImageData

        await expect(locateWithYOLOServer(imageData, cv)).resolves.toBeNull()
    })

    it('short-circuits after too many errors', async () => {
        const { locateWithYOLOServer } = await import('../locateWithYOLOServer')
        const cv = createCV()
        cv.resize = jest.fn(() => {
            throw new Error('resize fail')
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
            await expect(
                locateWithYOLOServer(imageData, cv)
            ).resolves.toBeNull()
        }

        await expect(locateWithYOLOServer(imageData, cv)).resolves.toBeNull()
        expect(warnSpy).toHaveBeenCalledWith(
            'Too many errors in locateWithYOLOServer, skipping processing.'
        )

        errorSpy.mockRestore()
        warnSpy.mockRestore()
    })
})
