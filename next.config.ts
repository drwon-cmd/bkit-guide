import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // External packages for server-side
  serverExternalPackages: ['@xenova/transformers'],

  // Output file tracing root
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
