import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  turbopack: { root: process.cwd() },
  serverExternalPackages: ['@resvg/resvg-js'],
  async rewrites() {
    return [{ source: '/npm/:path*', destination: '/api/npm?p=:path*' }];
  },
  async headers() {
    return [
      { source: '/sprites/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/svg/linear/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' }] },
    ];
  },
};

export default nextConfig;
