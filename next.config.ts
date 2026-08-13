import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**'],
      };
    }
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // ⚠️ No rewrites for /api/*. All routing is handled by the Next.js route
  // files in app/api/ (same-origin cookie proxy pattern).
  // A rewrite like "/api/:path* → render-backend/api/:path*" would bypass
  // those handlers, sending requests cross-origin to Django directly and
  // causing cookies to be silently dropped + ERR_TOO_MANY_REDIRECTS loops.
};

export default nextConfig;
