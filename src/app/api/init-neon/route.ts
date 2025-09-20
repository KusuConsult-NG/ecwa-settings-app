import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST() {
  try {
    console.log('🔧 NEON INIT: Starting Neon database initialization...');
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL not available' 
      }, { status: 500 });
    }

    // Create direct Neon connection
    const sql = neon(process.env.DATABASE_URL);
    console.log('🔧 NEON INIT: Database connection created');

    // Step 1: Create kv_store table
    console.log('1️⃣ Creating kv_store table...');
    await sql`
      CREATE TABLE IF NOT EXISTS kv_store (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('✅ kv_store table created');

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
    await sql`
      INSERT INTO kv_store (key, value, created_at, updated_at)
      VALUES ('user:admin@example.com', ${JSON.stringify(adminUser)}, NOW(), NOW())
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW();
    `;
    console.log('✅ Admin user stored');

    // Step 4: Verify storage
    console.log('4️⃣ Verifying storage...');
    const result = await sql`
      SELECT key, value FROM kv_store 
      WHERE key = 'user:admin@example.com'
    `;
    
    if (result.length > 0) {
      const user = JSON.parse(result[0].value);
      console.log('✅ Verification successful:', {
        email: user.email,
        name: user.name,
        role: user.role
      });
      
      return NextResponse.json({
        success: true,
        message: 'Neon database initialized successfully',
        user: {
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } else {
      throw new Error('User not found after storage');
    }

  } catch (error) {
    console.error('❌ NEON INIT: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Neon database initialization endpoint',
    endpoint: '/api/init-neon',
    method: 'POST'
  });
}
