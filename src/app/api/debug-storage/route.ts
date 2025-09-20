import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export async function GET() {
  try {
    console.log('🔍 Debugging storage...');
    
    // Check if we can access storage
    const testKey = 'debug:test';
    const testValue = 'test-value';
    
    // Test set
    await kv.set(testKey, testValue);
    console.log('✅ Set operation successful');
    
    // Test get
    const retrievedValue = await kv.get(testKey);
    console.log('✅ Get operation successful:', retrievedValue);
    
    // Check for test user
    const testUser = await kv.get('user:test@example.com');
    console.log('👤 Test user found:', !!testUser);
    
    // Check for admin user
    const adminUser = await kv.get('user:admin@example.com');
    console.log('👑 Admin user found:', !!adminUser);
    
    // List all users (this is a simple approach)
    const allUsers = [];
    const testEmails = ['test@example.com', 'admin@example.com'];
    
    for (const email of testEmails) {
      const userData = await kv.get(`user:${email}`);
      if (userData) {
        const user = JSON.parse(userData);
        allUsers.push({
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Storage debug completed',
      testValue: retrievedValue,
      usersFound: allUsers.length,
      users: allUsers,
      storageWorking: retrievedValue === testValue
    });
    
  } catch (error) {
    console.error('❌ Storage debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
