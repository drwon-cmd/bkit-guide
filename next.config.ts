import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // External packages for server-side
  serverExternalPackages: ['@lancedb/lancedb', '@xenova/transformers'],
  
  // Webpack config
  webpack: (config, { isServer }) => {
    // Handle native modules
    if (isServer) {
      config.externals = [...(config.externals || []), '@lancedb/lancedb'];
    }
    
    // Ignore native .node files
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader',
    });
    
    return config;
  },
  
  // Output file tracing root
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
