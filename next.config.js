/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone mode creates a self-contained build with minimal node_modules
  // This eliminates ALL dependency issues on Azure
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
}

module.exports = nextConfig
