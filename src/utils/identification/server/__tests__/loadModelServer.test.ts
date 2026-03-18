export {}

const createMock = jest.fn()

jest.mock('onnxruntime-node', () => {
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
        Tensor: MockTensor,
        InferenceSession: {
            create: (...args: unknown[]) => createMock(...args)
        }
    }
})

describe('loadModelServer', () => {
    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()
    })

    it('loads and warms model, then reuses cached session', async () => {
        const { loadModelServer } = await import('../loadModelServer')

        const disposeA = jest.fn()
        const disposeB = jest.fn()
        const run = jest.fn().mockResolvedValue({
            boxes: { dispose: disposeA },
            scores: { dispose: disposeB }
        })
        const session = {
            outputNames: ['boxes', 'scores'],
            run
        }

        createMock.mockResolvedValue(session)

        const loadedA = await loadModelServer('/models/yolo.onnx')
        const loadedB = await loadModelServer('/models/yolo.onnx')

        expect(loadedA).toBe(session)
        expect(loadedB).toBe(session)
        expect(createMock).toHaveBeenCalledTimes(1)
        expect(run).toHaveBeenCalledTimes(1)
        expect(disposeA).toHaveBeenCalledTimes(1)
        expect(disposeB).toHaveBeenCalledTimes(1)
    })

    it('throws a friendly error when model creation fails', async () => {
        const { loadModelServer } = await import('../loadModelServer')
        createMock.mockRejectedValue(new Error('nope'))

        await expect(loadModelServer('/bad/model.onnx')).rejects.toThrow(
            'Failed to load model at /bad/model.onnx: nope'
        )
    })

    it('stringifies non-Error creation failures', async () => {
        const { loadModelServer } = await import('../loadModelServer')
        createMock.mockRejectedValue('bad-news')

        await expect(loadModelServer('/bad/model.onnx')).rejects.toThrow(
            'Failed to load model at /bad/model.onnx: bad-news'
        )
    })
})
