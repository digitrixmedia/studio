/** @type {import('next').NextConfig} */

import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // We only want to cache static assets, not API calls to Firestore
    {
      urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 Days
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: false,

  // Prevent static export — we need full SSR for Firestore/Auth
  output: undefined,

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Allows Vercel SSR to work with your dynamic routes
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
};

export default pwaConfig(nextConfig);
