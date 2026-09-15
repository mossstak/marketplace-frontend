import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' } : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/roaster/dashboard',
        destination: '/seller/dashboard',
      },
      {
        source: '/roaster/dashboard/:path*',
        destination: '/seller/dashboard/:path*',
      },
    ];
  },
};

export default nextConfig;
