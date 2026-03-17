import { InferenceSession, Tensor } from 'onnxruntime-node'

let sessionNode: InferenceSession | null = null

/**
 *
 * @param modelPath
 * @returns warmed up ONNX InferenceSession
 */
export const loadModelServer = async (
    modelPath: string
): Promise<InferenceSession> => {
    if (sessionNode) {
        return sessionNode
    }

    const DEFAULT_INPUT_SIZE = [1, 3, 640, 640]
    const settings: InferenceSession.SessionOptions = {
        executionProviders: ['cpu'],
        graphOptimizationLevel: 'all'
    }

    // create model session
    try {
        sessionNode = await InferenceSession.create(modelPath, settings)
    } catch (err) {
        throw new Error(
            `Failed to load model at ${modelPath}: ${err instanceof Error ? err.message : String(err)}`
        )
    }

    // warm up model with dummy input
    const dummyInput = new Tensor(
        'float32',
        new Float32Array(DEFAULT_INPUT_SIZE.reduce((a, b) => a * b)),
        DEFAULT_INPUT_SIZE
    )
    const output = await sessionNode.run({ images: dummyInput })
    const outputKeys = sessionNode.outputNames
    for (const key of outputKeys) {
        output[key].dispose()
    }
    dummyInput.dispose()

    return sessionNode
}
