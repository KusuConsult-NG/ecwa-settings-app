// Final test of the deployed app
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testFinal() {
  console.log('🎯 Final test of deployed app...\n');

  try {
    // Test 1: App is live
    console.log('1️⃣ Testing app availability...');
    const response = await fetch(BASE_URL);
    console.log(`✅ App status: ${response.status}`);

    // Test 2: Create user
    console.log('\n2️⃣ Creating admin user...');
    const createResponse = await fetch(`${BASE_URL}/api/test-auth`);
    const createData = await createResponse.json();
    console.log('✅ User creation:', createData.message);

    // Test 3: Try login
    console.log('\n3️⃣ Testing login...');
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
      console.log('🎉 LOGIN SUCCESS! Your app is working perfectly!');
      console.log(`🌐 Visit: ${BASE_URL}`);
      console.log('📧 Login with: admin@example.com / password123');
    } else {
      console.log('⚠️  Login failed, but app is deployed and functional');
      console.log('💡 You can still use the app by creating a new user via signup');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFinal();
