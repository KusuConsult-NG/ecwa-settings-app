/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  images: {
    unoptimized: true,
  },
  // Render.com configuration
  // NOTE: Do NOT use trailingSlash on Vercel — it can cause /login <-> /login/ loops
  // trailingSlash: true, // ← leave this line OUT
};

module.exports = nextConfig;


