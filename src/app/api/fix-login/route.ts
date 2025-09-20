import { NextResponse } from 'next/server';
import { sql } from '@/lib/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST() {
  try {
    console.log('🔧 Fixing login by setting up database and admin user...');
    
    if (!sql) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 500 });
    }

    // Step 1: Create the kv_store table if it doesn't exist
    console.log('1️⃣ Creating kv_store table...');
    await sql`
      CREATE TABLE IF NOT EXISTS kv_store (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ kv_store table created');

    // Step 2: Create admin user directly in the database
    console.log('2️⃣ Creating admin user...');
    const passwordHash = await bcrypt.hash('password123', 12);
    const userId = crypto.randomUUID();
    const orgId = crypto.randomUUID();
    
    const adminUser = {
      id: userId,
      email: 'admin@example.com',
      name: 'Admin User',
      phone: '1234567890',
      address: 'Test Address',
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orgId: orgId,
      orgName: 'ECWA Organization',
      role: 'Admin',
      isActive: true,
      lastLogin: null
    };

    // Step 3: Store user in kv_store table
    console.log('3️⃣ Storing user in kv_store...');
    await sql`
      INSERT INTO kv_store (key, value, created_at, updated_at)
      VALUES ('user:admin@example.com', ${JSON.stringify(adminUser)}, NOW(), NOW())
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW();
    `;
    console.log('✅ Admin user stored in database');

    // Step 4: Verify the user was stored
    console.log('4️⃣ Verifying user storage...');
    const result = await sql`
      SELECT key, value FROM kv_store 
      WHERE key = 'user:admin@example.com'
    `;
    
    if (result.length > 0) {
      const storedUser = JSON.parse(result[0].value);
      console.log('✅ User verification successful:', {
        email: storedUser.email,
        name: storedUser.name,
        role: storedUser.role
      });
      
      return NextResponse.json({
        success: true,
        message: 'Login fix completed successfully',
        user: {
          email: storedUser.email,
          name: storedUser.name,
          role: storedUser.role
        },
        databaseStatus: 'Connected and working'
      });
    } else {
      throw new Error('User not found after storage');
    }

  } catch (error) {
    console.error('❌ Login fix error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Login fix endpoint. Use POST to fix login issues.',
    endpoint: '/api/fix-login',
    method: 'POST'
  });
}
