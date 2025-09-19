const fs = require('fs');

// Read existing users
const data = JSON.parse(fs.readFileSync('.data/users.json', 'utf8'));

// Add admin user with the same password hash as persistent@example.com
data['user:admin@example.com'] = JSON.stringify({
  id: 'admin-001',
  email: 'admin@example.com',
  name: 'Admin User',
  phone: '1234567890',
  address: 'Admin Address',
  passwordHash: '$2b$12$aycljP4kJF8zIQt6Ql8qzuo2.UANFvra4FW4DUSCdYax8KxQ5mQe.',
  createdAt: new Date().toISOString(),
  orgId: 'admin-org-001',
  orgName: 'ECWA Organization',
  role: 'Admin',
  isActive: true,
  lastLogin: null
});

// Write back to file
fs.writeFileSync('.data/users.json', JSON.stringify(data, null, 2));
console.log('Admin user added successfully');
console.log('Email: admin@example.com');
console.log('Password: admin123');
