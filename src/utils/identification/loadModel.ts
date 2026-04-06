// credit: https://github.com/nomi30701/yolo-multi-task-onnxruntime-web
import { InferenceSession, Tensor, env } from 'onnxruntime-web'
import { MODEL_INPUT_HEIGHT, MODEL_INPUT_WIDTH } from '../constants'

let session: InferenceSession | null = null

/**
 *
 * @param modelPath path relative to /public
 * @returns warmed up ONNX InferenceSession
 */
export const loadModel = async (
    modelPath: string
): Promise<InferenceSession> => {
    if (session) {
        return session
    }

    const DEFAULT_INPUT_SIZE = [1, 3, MODEL_INPUT_HEIGHT, MODEL_INPUT_WIDTH]
    const settings: InferenceSession.SessionOptions = {
        executionProviders: ['webgpu'],
        graphOptimizationLevel: 'all',
        enableCpuMemArena: true,
        enableMemPattern: true
    }

    env.wasm.simd = true

    // create model session
    try {
        session = await InferenceSession.create(modelPath, settings)

        // warm up model with dummy input
        const dummyInput = new Tensor(
            'float32',
            new Float32Array(DEFAULT_INPUT_SIZE.reduce((a, b) => a * b)),
            DEFAULT_INPUT_SIZE
        )
        const output = await session.run({ images: dummyInput })
        const outputKeys = session.outputNames
        for (const key of outputKeys) {
            output[key].dispose()
        }
        dummyInput.dispose()
    } catch (err) {
        console.error(
            'failed creating webgpu session, falling back to wasm. error:',
            err
        )

        try {
            const settings2: InferenceSession.SessionOptions = {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all',
                enableCpuMemArena: true,
                enableMemPattern: true
            }
            session = await InferenceSession.create(modelPath, settings2)

            // warm up model with dummy input
            const dummyInput2 = new Tensor(
                'float32',
                new Float32Array(DEFAULT_INPUT_SIZE.reduce((a, b) => a * b)),
                DEFAULT_INPUT_SIZE
            )
            const output2 = await session.run({ images: dummyInput2 })
            const outputKeys2 = session.outputNames
            for (const key of outputKeys2) {
                output2[key].dispose()
            }
            dummyInput2.dispose()
        } catch (err) {
            throw new Error(
                `Failed to load model at ${modelPath}: ${err instanceof Error ? err.message : String(err)}`
            )
        }
    }

    return session
}

export const releaseModel = () => {
    if (session) {
        session.release()
        session = null
    }
}
