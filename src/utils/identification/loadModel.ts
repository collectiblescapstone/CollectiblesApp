// credit: https://github.com/nomi30701/yolo-multi-task-onnxruntime-web
import { InferenceSession, Tensor, env, } from 'onnxruntime-web';

let session: InferenceSession | null = null;

/**
 * 
 * @param modelPath path relative to /public
 * @returns warmed up ONNX InferenceSession
 */
export const loadModel = async (modelPath: string): Promise<InferenceSession> => {
  if (session) {
    return session;
  }

  const DEFAULT_INPUT_SIZE = [1, 3, 640, 640];
  const settings: InferenceSession.SessionOptions = {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
    enableCpuMemArena: true,
    enableMemPattern: true,
  };

  env.wasm.simd = true;

  // create model session
  try {
    session = await InferenceSession.create(modelPath, settings);
  } catch (e) {
    // try without SIMD
    env.wasm.simd = false;
    session = await InferenceSession.create(modelPath, settings);
  }

  // warm up model with dummy input
  const dummyInput = new Tensor(
    'float32',
    new Float32Array(DEFAULT_INPUT_SIZE.reduce((a, b) => a * b)),
    DEFAULT_INPUT_SIZE
  );
  const { output0 } = await session.run({ images: dummyInput });
  output0.dispose();
  dummyInput.dispose();

  return session;
};
