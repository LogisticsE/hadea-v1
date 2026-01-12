/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed 'standalone' output - Vercel handles builds automatically
  // For Azure, you can add: output: 'standalone'
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
}

module.exports = nextConfig
