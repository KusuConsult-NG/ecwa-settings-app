// Test database connection across different endpoints
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testDatabaseConnection() {
  console.log('🔍 TESTING DATABASE CONNECTION ACROSS APPLICATION\n');

  try {
    // Test 1: Test-auth endpoint (should work)
    console.log('1️⃣ Testing test-auth endpoint...');
    const testAuthResponse = await fetch(`${BASE_URL}/api/test-auth`);
    const testAuthData = await testAuthResponse.json();
    console.log('✅ Test-auth result:', testAuthData);

    // Test 2: Signup endpoint (should work)
    console.log('\n2️⃣ Testing signup endpoint...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dbtest2@example.com',
        password: 'DbTest123!',
        name: 'DB Test User 2',
        phone: '1234567890',
        address: 'DB Test Address 2'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('✅ Signup result:', signupData);

    // Test 3: Login endpoint (currently failing)
    console.log('\n3️⃣ Testing login endpoint...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dbtest2@example.com',
        password: 'DbTest123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('❌ Login result:', loginData);

    // Test 4: Organizations endpoint (requires auth)
    console.log('\n4️⃣ Testing organizations endpoint...');
    const orgResponse = await fetch(`${BASE_URL}/api/organizations`);
    const orgData = await orgResponse.json();
    console.log('🔒 Organizations result:', orgData);

    // Test 5: Agencies endpoint (requires auth)
    console.log('\n5️⃣ Testing agencies endpoint...');
    const agenciesResponse = await fetch(`${BASE_URL}/api/agencies`);
    const agenciesData = await agenciesResponse.json();
    console.log('🔒 Agencies result:', agenciesData);

    console.log('\n📊 SUMMARY:');
    console.log('✅ test-auth: Working (uses KV storage)');
    console.log('✅ signup: Working (uses direct database)');
    console.log('❌ login: Failing (uses direct database)');
    console.log('🔒 organizations: Requires authentication');
    console.log('🔒 agencies: Requires authentication');

    console.log('\n🔍 ANALYSIS:');
    console.log('- Database connection works for some endpoints');
    console.log('- Signup works (creates users in database)');
    console.log('- Login fails (can\'t read users from database)');
    console.log('- This suggests a read/write inconsistency');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabaseConnection();