#!/usr/bin/env node

// Script to add dynamic = 'force-dynamic' to ALL pages for Vercel deployment
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const PAGES_DIR = 'src/app';

async function fixAllPagesDynamic() {
  try {
    console.log('🔧 Fixing ALL pages for dynamic rendering...');

    // Find all page files
    const pageFiles = await glob('**/page.tsx', { cwd: PAGES_DIR });
    
    console.log(`📁 Found ${pageFiles.length} page files`);

    let fixedCount = 0;

    for (const file of pageFiles) {
      const filePath = path.join(PAGES_DIR, file);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check if dynamic export already exists
        if (content.includes('export const dynamic = \'force-dynamic\'')) {
          console.log(`⏭️  Skipping ${file} - already has dynamic export`);
          continue;
        }
        
        // Add dynamic export at the top after "use client" if present
        let newContent = content;
        
        if (content.includes('"use client"')) {
          // Add after "use client"
          newContent = content.replace(
            '"use client"',
            '"use client"\n\nexport const dynamic = \'force-dynamic\';'
          );
        } else {
          // Add at the very top
          newContent = 'export const dynamic = \'force-dynamic\';\n\n' + content;
        }
        
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`✅ Fixed ${file}`);
        fixedCount++;
        
      } catch (error) {
        console.error(`❌ Error fixing ${file}:`, error.message);
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} pages for dynamic rendering!`);
    console.log('\n📋 Next steps:');
    console.log('1. Test the build: bun run build');
    console.log('2. Deploy to Vercel: vercel --prod');
    console.log('3. Set environment variables in Vercel dashboard');
    console.log('4. Initialize database: curl -X POST https://your-app.vercel.app/api/setup-db');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAllPagesDynamic();
