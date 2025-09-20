#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

async function setupTestData() {
  console.log('🚀 Setting up test data...');
  
  try {
    // Create test admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const testPassword = await bcrypt.hash('test123', 10);
    
    const users = [
      {
        id: 'admin-001',
        email: 'admin@ecwa.org',
        name: 'System Administrator',
        passwordHash: adminPassword,
        role: 'admin',
        orgId: 'org-001',
        orgName: 'ECWA Headquarters',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'user-001',
        email: 'test@ecwa.org',
        name: 'Test User',
        passwordHash: testPassword,
        role: 'Treasurer',
        orgId: 'org-001',
        orgName: 'ECWA Headquarters',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    const organizations = [
      {
        id: 'org-001',
        name: 'ECWA Headquarters',
        code: 'ECWA-HQ',
        address: '123 Church Street, Lagos, Nigeria',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        establishedDate: '1954-01-01',
        status: 'active',
        contactEmail: 'info@ecwa.org',
        contactPhone: '+234-123-456-7890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin-001'
      }
    ];
    
    // Load existing data
    const dataFile = path.join(process.cwd(), '.data', 'users.json');
    let data = {};
    
    try {
      const existingData = await fs.readFile(dataFile, 'utf-8');
      data = JSON.parse(existingData);
    } catch (error) {
      console.log('📝 Creating new data file...');
    }
    
    // Update with test data
    data['users:index'] = JSON.stringify(users);
    data['organizations:index'] = JSON.stringify(organizations);
    
    // Store individual users for login lookup
    for (const user of users) {
      data[`user:${user.email}`] = JSON.stringify(user);
    }
    
    // Create some test leaders for verification login
    const testLeaders = [
      {
        id: 'leader-001',
        firstName: 'Test',
        surname: 'Leader',
        email: 'leader@ecwa.org',
        position: 'Chairman',
        organizationId: 'org-001',
        organizationLevel: 'LC',
        verificationCode: '123456',
        verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        verificationStatus: 'pending',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'leader-002',
        firstName: 'John',
        surname: 'Doe',
        email: 'john@ecwa.org',
        position: 'Secretary',
        organizationId: 'org-001',
        organizationLevel: 'DCC',
        verificationCode: '654321',
        verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        verificationStatus: 'pending',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    data['leaders:index'] = JSON.stringify(testLeaders);
    for (const leader of testLeaders) {
      data[`leader:${leader.id}`] = JSON.stringify(leader);
    }
    
    // Save updated data
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    
    console.log('✅ Test data setup complete!');
    console.log('');
    console.log('🔑 Test Credentials:');
    console.log('Regular Login:');
    console.log('  Admin: admin@ecwa.org / admin123');
    console.log('  User:  test@ecwa.org / test123');
    console.log('');
    console.log('Leader Verification Login:');
    console.log('  Leader 1: leader@ecwa.org / 123456');
    console.log('  Leader 2: john@ecwa.org / 654321');
    console.log('');
    console.log('🚀 You can now run: bun run dev');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData();
