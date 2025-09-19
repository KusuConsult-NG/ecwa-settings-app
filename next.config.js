/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  images: {
    unoptimized: true,
  },
  // Vercel configuration
  // NOTE: Do NOT use trailingSlash on Vercel — it can cause /login <-> /login/ loops
  // trailingSlash: true, // ← leave this line OUT
};

module.exports = nextConfig;


