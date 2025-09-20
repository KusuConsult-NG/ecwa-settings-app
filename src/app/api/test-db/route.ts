import { NextResponse } from 'next/server';
import { sql } from '@/lib/database';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    if (!sql) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available - sql is null',
        databaseUrl: !!process.env.DATABASE_URL
      }, { status: 500 });
    }

    // Test 1: Simple query
    console.log('1️⃣ Testing simple query...');
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Simple query result:', result);

    // Test 2: Check if kv_store table exists
    console.log('2️⃣ Checking kv_store table...');
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'kv_store'
    `;
    console.log('✅ Table check result:', tableCheck);

    // Test 3: Count records in kv_store
    console.log('3️⃣ Counting records in kv_store...');
    const countResult = await sql`SELECT COUNT(*) as count FROM kv_store`;
    console.log('✅ Record count:', countResult);

    // Test 4: List all users
    console.log('4️⃣ Listing all users...');
    const users = await sql`
      SELECT key, value 
      FROM kv_store 
      WHERE key LIKE 'user:%'
      LIMIT 10
    `;
    console.log('✅ Users found:', users.length);

    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      results: {
        simpleQuery: result,
        tableExists: tableCheck.length > 0,
        recordCount: countResult[0]?.count || 0,
        userCount: users.length,
        users: users.map(u => ({ key: u.key, email: JSON.parse(u.value).email }))
      }
    });

  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
