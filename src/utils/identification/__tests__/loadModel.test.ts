const createMock = jest.fn()

jest.mock('onnxruntime-web', () => {
    class MockTensor {
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

    return {
        env: { wasm: { simd: true } },
        Tensor: MockTensor,
        InferenceSession: {
            create: (...args: unknown[]) => createMock(...args)
        }
    }
})

describe('loadModel', () => {
    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()
    })

    it('loads and warms model, then reuses cached session', async () => {
        const { loadModel } = await import('../loadModel')
        const rt = await import('onnxruntime-web')

        const disposeA = jest.fn()
        const disposeB = jest.fn()
        const run = jest.fn().mockResolvedValue({
            boxes: { dispose: disposeA },
            scores: { dispose: disposeB }
        })
        const session = {
            outputNames: ['boxes', 'scores'],
            run,
            release: jest.fn()
        }

        createMock.mockResolvedValue(session)

        const loadedA = await loadModel('/models/yolo.onnx')
        const loadedB = await loadModel('/models/yolo.onnx')

        expect(loadedA).toBe(session)
        expect(loadedB).toBe(session)
        expect(createMock).toHaveBeenCalledTimes(1)
        expect(createMock).toHaveBeenCalledWith(
            '/models/yolo.onnx',
            expect.objectContaining({
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            })
        )

        expect(rt.env.wasm.simd).toBe(false)
        expect(run).toHaveBeenCalledTimes(1)
        expect(run.mock.calls[0][0]).toHaveProperty('images')
        expect(disposeA).toHaveBeenCalledTimes(1)
        expect(disposeB).toHaveBeenCalledTimes(1)

        const tensor = run.mock.calls[0][0].images as {
            dims: number[]
            dispose: jest.Mock
        }
        expect(tensor.dims).toEqual([1, 3, 640, 640])
        expect(tensor.dispose).toHaveBeenCalledTimes(1)
    })

    it('throws a friendly error when session creation fails', async () => {
        const { loadModel, releaseModel } = await import('../loadModel')
        releaseModel()
        createMock.mockRejectedValue(new Error('boom'))

        await expect(loadModel('/bad/model.onnx')).rejects.toThrow(
            'Failed to load model at /bad/model.onnx: boom'
        )
    })

    it('stringifies non-Error thrown values when load fails', async () => {
        const { loadModel, releaseModel } = await import('../loadModel')
        releaseModel()
        createMock.mockRejectedValue('bad-news')

        await expect(loadModel('/bad/model.onnx')).rejects.toThrow(
            'Failed to load model at /bad/model.onnx: bad-news'
        )
    })

    it('releases cached session and allows a new load', async () => {
        const { loadModel, releaseModel } = await import('../loadModel')

        const runA = jest
            .fn()
            .mockResolvedValue({ out: { dispose: jest.fn() } })
        const runB = jest
            .fn()
            .mockResolvedValue({ out: { dispose: jest.fn() } })
        const sessionA = { outputNames: ['out'], run: runA, release: jest.fn() }
        const sessionB = { outputNames: ['out'], run: runB, release: jest.fn() }

        createMock
            .mockResolvedValueOnce(sessionA)
            .mockResolvedValueOnce(sessionB)

        const first = await loadModel('/models/yolo.onnx')
        releaseModel()
        const second = await loadModel('/models/yolo.onnx')

        expect(first).toBe(sessionA)
        expect(second).toBe(sessionB)
        expect(sessionA.release).toHaveBeenCalledTimes(1)
        expect(createMock).toHaveBeenCalledTimes(2)
    })
})
