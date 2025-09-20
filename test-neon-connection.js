#!/usr/bin/env node

// Test script to verify Neon database connection
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('Please add DATABASE_URL to your .env.local file');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function testConnection() {
  try {
    console.log('🔌 Testing Neon database connection...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    console.log('✅ Database connection successful!');
    console.log(`📅 Current time: ${result[0].current_time}`);
    console.log(`🐘 PostgreSQL version: ${result[0].postgres_version}`);
    
    // Test table creation
    console.log('\n🔧 Testing table creation...');
    await sql`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Test table created successfully');
    
    // Test insert
    console.log('\n📝 Testing data insertion...');
    const insertResult = await sql`
      INSERT INTO test_table (name) 
      VALUES ('Test Record') 
      RETURNING id, name, created_at
    `;
    console.log('✅ Data inserted successfully:', insertResult[0]);
    
    // Test select
    console.log('\n📖 Testing data retrieval...');
    const selectResult = await sql`SELECT * FROM test_table ORDER BY created_at DESC LIMIT 5`;
    console.log('✅ Data retrieved successfully:');
    selectResult.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}, Name: ${row.name}, Created: ${row.created_at}`);
    });
    
    // Test update
    console.log('\n✏️  Testing data update...');
    const updateResult = await sql`
      UPDATE test_table 
      SET name = 'Updated Test Record' 
      WHERE id = ${insertResult[0].id}
      RETURNING id, name, updated_at
    `;
    console.log('✅ Data updated successfully:', updateResult[0]);
    
    // Test delete
    console.log('\n🗑️  Testing data deletion...');
    const deleteResult = await sql`
      DELETE FROM test_table 
      WHERE id = ${insertResult[0].id}
      RETURNING id
    `;
    console.log('✅ Data deleted successfully, ID:', deleteResult[0].id);
    
    // Clean up test table
    await sql`DROP TABLE IF EXISTS test_table`;
    console.log('🧹 Test table cleaned up');
    
    console.log('\n🎉 All tests passed! Neon database is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Run: bun run migrate-neon');
    console.log('2. Start your app: bun dev');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env.local');
    console.log('2. Verify your Neon database is active');
    console.log('3. Check your network connection');
    console.log('4. Ensure your IP is whitelisted in Neon console');
    process.exit(1);
  }
}

// Run test
testConnection();
