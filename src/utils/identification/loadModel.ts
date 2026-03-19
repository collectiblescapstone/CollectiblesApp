// credit: https://github.com/nomi30701/yolo-multi-task-onnxruntime-web
import { InferenceSession, Tensor, env } from 'onnxruntime-web'

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

    const DEFAULT_INPUT_SIZE = [1, 3, 640, 640]
    const settings: InferenceSession.SessionOptions = {
        executionProviders: ['nnapi', 'webgpu'],
        enableCpuMemArena: true,
        enableMemPattern: true,
        graphOptimizationLevel: 'all'
    }

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
        console.log('failed creating webgpu session, falling back to wasm', err)

        try {
            const settingsCPU: InferenceSession.SessionOptions = {
                executionProviders: ['wasm'],
                enableCpuMemArena: true,
                enableMemPattern: true,
                graphOptimizationLevel: 'all'
            }

            env.wasm.simd = true

            session = await InferenceSession.create(modelPath, settingsCPU)

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
            throw new Error(
                'failed to create ONNX Runtime session with both webgpu and wasm backends: ' +
                    err
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
