import { NextResponse } from 'next/server';
import { neonKV } from '@/lib/neon-kv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST() {
  try {
    console.log('🔧 FORCE INITIALIZING DATABASE...');
    
    // Step 1: Initialize KV store
    console.log('1️⃣ Initializing KV store...');
    await neonKV.initKVStore();
    console.log('✅ KV store initialized');

    // Step 2: Create admin user
    console.log('2️⃣ Creating admin user...');
    const passwordHash = await bcrypt.hash('password123', 12);
    const adminUser = {
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

    // Step 3: Store admin user
    console.log('3️⃣ Storing admin user...');
    await neonKV.set(`user:admin@example.com`, JSON.stringify(adminUser));
    console.log('✅ Admin user stored');

    // Step 4: Verify storage
    console.log('4️⃣ Verifying storage...');
    const storedUser = await neonKV.get(`user:admin@example.com`);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('✅ User verification successful:', {
        email: user.email,
        name: user.name,
        role: user.role
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database force initialization completed',
      user: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('❌ Force init error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Force initialization endpoint. Use POST to force init.',
    endpoint: '/api/force-init',
    method: 'POST'
  });
}
