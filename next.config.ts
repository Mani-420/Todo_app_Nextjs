import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // External packages for server components
  serverExternalPackages: ['mongoose'],
  // Ensure proper static file handling
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
