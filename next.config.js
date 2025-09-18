/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs']
  },
  // Netlify specific configuration
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig


