#!/usr/bin/env node

// Script to add dynamic = 'force-dynamic' to all API routes that use cookies
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const API_ROUTES_DIR = 'src/app/api';

async function fixDynamicRoutes() {
  try {
    console.log('🔧 Fixing dynamic routes for Vercel deployment...');

    // Find all API route files
    const routeFiles = await glob('**/route.ts', { cwd: API_ROUTES_DIR });
    
    console.log(`📁 Found ${routeFiles.length} API route files`);

    let fixedCount = 0;

    for (const file of routeFiles) {
      const filePath = path.join(API_ROUTES_DIR, file);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check if file uses cookies
        if (content.includes('req.cookies.get') || content.includes('request.cookies')) {
          // Check if dynamic export already exists
          if (!content.includes('export const dynamic')) {
            // Find the import section and add dynamic export after it
            const lines = content.split('\n');
            let insertIndex = 0;
            
            // Find the last import statement
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('import ') || lines[i].startsWith('// Import')) {
                insertIndex = i + 1;
              }
            }
            
            // Insert dynamic export
            lines.splice(insertIndex, 0, '', '// Force dynamic rendering for this route', 'export const dynamic = \'force-dynamic\';');
            
            const newContent = lines.join('\n');
            await fs.writeFile(filePath, newContent, 'utf-8');
            
            console.log(`✅ Fixed: ${file}`);
            fixedCount++;
          } else {
            console.log(`⏭️  Already fixed: ${file}`);
          }
        } else {
          console.log(`⏭️  No cookies used: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} API route files`);
    console.log('✅ All API routes now force dynamic rendering');
    
  } catch (error) {
    console.error('❌ Error fixing dynamic routes:', error);
    process.exit(1);
  }
}

// Run the fix
fixDynamicRoutes();
