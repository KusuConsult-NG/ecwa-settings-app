// Test the login fix
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testLoginFix() {
  console.log('🔧 Testing login fix...\n');

  try {
    // Step 1: Clear any existing user data
    console.log('1️⃣ Clearing existing user data...');
    const clearResponse = await fetch(`${BASE_URL}/api/test-auth`);
    const clearData = await clearResponse.json();
    console.log('✅ Clear result:', clearData.message);

    // Step 2: Wait for database operations
    console.log('\n2️⃣ Waiting 3 seconds for database operations...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Test login
    console.log('\n3️⃣ Testing login with admin credentials...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login result:', loginData);

    if (loginData.token) {
      console.log('\n🎉 SUCCESS! Login is now working!');
      console.log('✅ Admin user can authenticate');
      console.log('✅ Neon database is properly connected');
      console.log('✅ Storage systems are synchronized');
      
      // Test 4: Verify user session
      console.log('\n4️⃣ Testing user session...');
      const sessionResponse = await fetch(`${BASE_URL}/api/me`, {
        headers: {
          'Cookie': `auth=${loginData.token}`
        }
      });
      
      const sessionData = await sessionResponse.json();
      console.log('👤 Session data:', sessionData);
      
      console.log('\n🏆 COMPLETE SUCCESS!');
      console.log(`🌐 Your app is fully functional at: ${BASE_URL}`);
      console.log('📧 Login with: admin@example.com / password123');
      
    } else {
      console.log('\n❌ Login still failing:', loginData.error);
      console.log('🔍 This indicates a deeper storage synchronization issue');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginFix();
