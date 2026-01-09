/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: standalone mode disabled for Azure compatibility
  // Azure Oryx build system handles the deployment differently
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
}

module.exports = nextConfig
