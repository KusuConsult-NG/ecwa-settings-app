import { NextResponse } from 'next/server';
import { initializeDatabase, getUsersCollection } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST() {
  try {
    console.log('🔧 MONGO INIT: Initializing MongoDB database...');
    
    // Initialize database with indexes
    await initializeDatabase();
    
    // Create default admin user if it doesn't exist
    const usersCollection = await getUsersCollection();
    const adminExists = await usersCollection.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      const adminUser = {
        email: 'admin@example.com',
        name: 'Admin User',
        phone: '1234567890',
        address: 'Admin Address',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'Admin',
        orgId: crypto.randomUUID(),
        orgName: 'ECWA Organization',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      };
      
      await usersCollection.insertOne(adminUser);
      console.log('✅ MONGO INIT: Default admin user created');
    } else {
      console.log('ℹ️ MONGO INIT: Admin user already exists');
    }
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB database initialized successfully',
      features: [
        'MongoDB Atlas connection',
        'Vercel Functions integration',
        'Automatic connection pooling',
        'Indexed collections',
        'Default admin user created'
      ]
    });

  } catch (error) {
    console.error('❌ MONGO INIT: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MongoDB database initialization endpoint',
    endpoint: '/api/init-mongo',
    method: 'POST',
    features: [
      'MongoDB Atlas connection',
      'Vercel Functions integration',
      'Automatic connection pooling',
      'Indexed collections'
    ]
  });
}
