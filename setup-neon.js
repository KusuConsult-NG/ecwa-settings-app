#!/usr/bin/env node

// Setup script for Neon database integration
import fs from 'fs/promises';
import path from 'path';

const ENV_FILE = path.join(process.cwd(), '.env.local');
const ENV_EXAMPLE = path.join(process.cwd(), '.env.neon.example');

async function setupNeon() {
  try {
    console.log('🚀 Setting up Neon database integration...');

    // Create .env.neon.example file
    const envExampleContent = `# Neon Database Configuration
# Get your connection string from: https://console.neon.tech/
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb

# Authentication (REQUIRED)
AUTH_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Key-Value Storage (Optional - falls back to Neon if DATABASE_URL is set)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Environment
NODE_ENV=development`;

    await fs.writeFile(ENV_EXAMPLE, envExampleContent);
    console.log('✅ Created .env.neon.example file');

    // Check if .env.local exists
    try {
      await fs.access(ENV_FILE);
      console.log('📄 .env.local file exists');
      
      // Read current content
      const currentContent = await fs.readFile(ENV_FILE, 'utf-8');
      
      if (!currentContent.includes('DATABASE_URL')) {
        console.log('⚠️  DATABASE_URL not found in .env.local');
        console.log('📝 Please add your Neon database URL to .env.local:');
        console.log('   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb');
      } else {
        console.log('✅ DATABASE_URL found in .env.local');
      }
    } catch (error) {
      console.log('❌ .env.local file not found');
      console.log('📝 Please create .env.local with your configuration:');
      console.log('   cp .env.neon.example .env.local');
      console.log('   # Then edit .env.local with your actual values');
    }

    console.log('\n📋 Next steps:');
    console.log('1. Get your Neon database URL from: https://console.neon.tech/');
    console.log('2. Add DATABASE_URL to your .env.local file');
    console.log('3. Run: bun run migrate-to-neon.js');
    console.log('4. Start your app: bun dev');
    
    console.log('\n🎉 Neon database setup complete!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupNeon();
