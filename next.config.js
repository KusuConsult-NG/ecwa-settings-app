/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', '@neondatabase/serverless'],
  },
  images: {
    unoptimized: true,
  },
  // Disable static optimization for pages with client-side hooks
  trailingSlash: false,
  // Vercel configuration
  // NOTE: Do NOT use trailingSlash on Vercel — it can cause /login <-> /login/ loops
  // trailingSlash: true, // ← leave this line OUT
};

module.exports = nextConfig;


