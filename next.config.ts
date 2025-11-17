import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  webpack: (config) => {
    // required for opencv-js to work in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  }
};

export default nextConfig;
