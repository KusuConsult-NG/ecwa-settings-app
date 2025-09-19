/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  images: {
    unoptimized: true,
  },
  // GitHub Pages configuration
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/ecwa-settings-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ecwa-settings-app' : '',
  // NOTE: Do NOT use trailingSlash on Vercel — it can cause /login <-> /login/ loops
  // trailingSlash: true, // ← leave this line OUT
};

module.exports = nextConfig;


