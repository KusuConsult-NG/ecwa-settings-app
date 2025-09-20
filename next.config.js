/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', '@neondatabase/serverless'],
    // Disable static optimization
    staticPageGenerationTimeout: 1000,
  },
  images: {
    unoptimized: true,
  },
  // Disable static optimization for pages with client-side hooks
  trailingSlash: false,
  // Vercel configuration
  // NOTE: Do NOT use trailingSlash on Vercel — it can cause /login <-> /login/ loops
  // trailingSlash: true, // ← leave this line OUT
  
  // CRITICAL: Force all pages to be server-rendered
  output: 'standalone',
  
  // Disable static generation completely
  generateStaticParams: false,
  
  // Force dynamic rendering for all routes
  dynamicParams: true,
  
  // Skip static optimization entirely
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;


