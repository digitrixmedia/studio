/** @type {import('next').NextConfig} */
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

export default nextConfig;
