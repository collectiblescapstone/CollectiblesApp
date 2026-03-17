import type { NextConfig } from 'next'
import dotenv from 'dotenv'

dotenv.config()

const isStatic = process.env.BUILD_OPTION === 'static'

const nextConfig: NextConfig = {
    ...(isStatic ? { output: 'export' } : {}),
    experimental: {
        optimizePackageImports: ['@chakra-ui/react']
    },
    webpack: (config) => {
        // required for opencv-js to work in the browser
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            crypto: false
        }

        return config
    },
    outputFileTracingExcludes: {
        '/': [
            'node_modules/@huggingface/transformers/node_modules/onnxruntime-node/bin/napi-v3/linux/x64/!(libonnxruntime.so.1|onnxruntime_binding.node)'
        ]
    }
}

export default nextConfig
