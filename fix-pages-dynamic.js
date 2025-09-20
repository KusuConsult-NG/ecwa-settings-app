#!/usr/bin/env node

// Script to add dynamic = 'force-dynamic' to all pages that use React context
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const PAGES_DIR = 'src/app';

async function fixPagesDynamic() {
  try {
    console.log('🔧 Fixing pages for dynamic rendering...');

    // Find all page files
    const pageFiles = await glob('**/page.tsx', { cwd: PAGES_DIR });
    
    console.log(`📁 Found ${pageFiles.length} page files`);

    let fixedCount = 0;

    for (const file of pageFiles) {
      const filePath = path.join(PAGES_DIR, file);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check if file uses React context or client-side features
        if (content.includes('useContext') || 
            content.includes('useState') || 
            content.includes('useEffect') ||
            content.includes('"use client"') ||
            content.includes('createContext') ||
            content.includes('useRouter') ||
            content.includes('usePathname') ||
            content.includes('useSearchParams')) {
          
          // Check if dynamic export already exists
          if (!content.includes('export const dynamic')) {
            // Find the import section and add dynamic export after it
            const lines = content.split('\n');
            let insertIndex = 0;
            
            // Find the last import statement or "use client" directive
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('import ') || 
                  lines[i].startsWith('// Import') ||
                  lines[i].startsWith('"use client"')) {
                insertIndex = i + 1;
              }
            }
            
            // Insert dynamic export
            lines.splice(insertIndex, 0, '', '// Force dynamic rendering for this page', 'export const dynamic = \'force-dynamic\';');
            
            const newContent = lines.join('\n');
            await fs.writeFile(filePath, newContent, 'utf-8');
            
            console.log(`✅ Fixed: ${file}`);
            fixedCount++;
          } else {
            console.log(`⏭️  Already fixed: ${file}`);
          }
        } else {
          console.log(`⏭️  No context used: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} page files`);
    console.log('✅ All pages now force dynamic rendering');
    
  } catch (error) {
    console.error('❌ Error fixing pages:', error);
    process.exit(1);
  }
}

// Run the fix
fixPagesDynamic();
