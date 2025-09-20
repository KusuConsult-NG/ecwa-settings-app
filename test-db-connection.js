// Test Neon Database Connection
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_8iVZwHmaxgy7@ep-old-truth-admsvs0a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  try {
    console.log('🔌 Testing Neon database connection...');
    
    const sql = neon(DATABASE_URL);
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    
    console.log('✅ Database connected successfully!');
    console.log('📅 Current time:', result[0].current_time);
    console.log('🐘 PostgreSQL version:', result[0].postgres_version);
    
    // Test if we can create tables
    console.log('\n🔧 Testing table creation...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ Table creation successful!');
    
    // Test insert
    await sql`
      INSERT INTO test_table (name) 
      VALUES ('Test Entry') 
      ON CONFLICT DO NOTHING
    `;
    
    console.log('✅ Insert operation successful!');
    
    // Test select
    const testData = await sql`SELECT * FROM test_table LIMIT 5`;
    console.log('✅ Select operation successful!');
    console.log('📊 Test data:', testData);
    
    // Clean up test table
    await sql`DROP TABLE IF EXISTS test_table`;
    console.log('🧹 Test table cleaned up!');
    
    console.log('\n🎉 All database tests passed! Your Neon database is ready for deployment.');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check if the DATABASE_URL is correct');
    console.error('2. Verify your Neon database is active');
    console.error('3. Check if your IP is whitelisted in Neon console');
    console.error('4. Ensure the database exists and is accessible');
  }
}

testConnection();
