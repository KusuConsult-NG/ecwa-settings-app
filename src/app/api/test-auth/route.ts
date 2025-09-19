import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function GET() {
  try {
    // Check if there are any users in the KV store
    const testEmail = 'admin@example.com';
    const userData = await kv.get(`user:${testEmail}`);
    
    if (!userData) {
      // Create a default admin user
      const passwordHash = await bcrypt.hash('admin123', 12);
      const user = {
        id: crypto.randomUUID(),
        email: testEmail,
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
      
      await kv.set(`user:${testEmail}`, JSON.stringify(user));
      
      return NextResponse.json({ 
        message: 'Default admin user created',
        user: {
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }
    
    const user = JSON.parse(userData);
    return NextResponse.json({ 
      message: 'User found',
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ 
      error: 'Failed to check auth state',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
