const fs = require('fs');
const path = require('path');

const apiFiles = [
  'src/app/api/agencies/route.ts',
  'src/app/api/lc/route.ts', 
  'src/app/api/lcc/route.ts',
  'src/app/api/queries/route.ts',
  'src/app/api/leave/route.ts',
  'src/app/api/payroll/route.ts',
  'src/app/api/staff/route.ts'
];

const libMappings = {
  'src/app/api/agencies/route.ts': {
    lib: '@/lib/agencies',
    interfaces: ['AgencyRecord', 'CreateAgencyRequest', 'generateAgencyId']
  },
  'src/app/api/lc/route.ts': {
    lib: '@/lib/lc', 
    interfaces: ['LCRecord', 'CreateLCRequest', 'generateLCId']
  },
  'src/app/api/lcc/route.ts': {
    lib: '@/lib/lcc',
    interfaces: ['LCCRecord', 'CreateLCCRequest', 'generateLCCId']
  },
  'src/app/api/queries/route.ts': {
    lib: '@/lib/queries',
    interfaces: ['QueryRecord', 'CreateQueryRequest', 'generateQueryId']
  },
  'src/app/api/leave/route.ts': {
    lib: '@/lib/leave',
    interfaces: ['LeaveRecord', 'CreateLeaveRequest', 'generateLeaveId']
  },
  'src/app/api/payroll/route.ts': {
    lib: '@/lib/payroll',
    interfaces: ['PayrollRecord', 'CreatePayrollRequest', 'generatePayrollId']
  },
  'src/app/api/staff/route.ts': {
    lib: '@/lib/staff',
    interfaces: ['StaffRecord', 'CreateStaffRequest', 'generateStaffId']
  }
};

apiFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const mapping = libMappings[filePath];
    
    // Remove interface exports (lines that start with "export interface")
    content = content.replace(/export interface [^{]*\{[^}]*\}/gs, '');
    
    // Add import from lib file
    const importLine = `import { ${mapping.interfaces.join(', ')} } from '${mapping.lib}';`;
    
    // Find the last import line and add after it
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, importLine);
    } else {
      lines.unshift(importLine);
    }
    
    // Clean up extra empty lines
    content = lines.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
});

console.log('All API routes fixed!');
