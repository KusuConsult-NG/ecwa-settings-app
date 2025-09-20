import { NextResponse } from 'next/server';
import { neonKV } from '@/lib/neon-kv';

export async function POST() {
  try {
    console.log('🔧 Initializing database tables...');
    
    // Initialize the KV store table
    await neonKV.initKVStore();
    
    // Create a test user directly in Neon
    const bcrypt = require('bcryptjs');
    const crypto = require('crypto');
    
    const passwordHash = await bcrypt.hash('password123', 12);
    const user = {
      id: crypto.randomUUID(),
      email: 'admin@example.com',
      name: 'Admin User',
      phone: '1234567890',
      address: 'Test Address',
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orgId: crypto.randomUUID(),
      orgName: 'ECWA Organization',
      role: 'Admin',
      isActive: true,
      lastLogin: null
    };
    
    // Store user in Neon KV
    await neonKV.set(`user:admin@example.com`, JSON.stringify(user));
    
    console.log('✅ Database initialized and admin user created in Neon');
    
    return NextResponse.json({ 
      success: true,
      message: 'Database initialized successfully',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Database initialization endpoint. Use POST to initialize.',
    endpoint: '/api/init-db',
    method: 'POST'
  });
}
