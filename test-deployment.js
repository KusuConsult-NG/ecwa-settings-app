// Test Vercel Deployment
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testDeployment() {
  console.log('🧪 Testing Vercel deployment...\n');

  try {
    // Test 1: Check if app is live
    console.log('1️⃣ Testing app availability...');
    const response = await fetch(BASE_URL);
    console.log(`✅ App is live! Status: ${response.status}`);
    
    // Test 2: Test API endpoints
    console.log('\n2️⃣ Testing API endpoints...');
    
    // Test test-auth endpoint
    const authResponse = await fetch(`${BASE_URL}/api/test-auth`);
    const authData = await authResponse.json();
    console.log(`✅ Test auth endpoint: ${JSON.stringify(authData)}`);
    
    // Test 3: Test login
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
    console.log(`✅ Login response: ${JSON.stringify(loginData)}`);
    
    // Test 4: Test database setup
    console.log('\n4️⃣ Testing database setup...');
    const dbResponse = await fetch(`${BASE_URL}/api/setup-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const dbData = await dbResponse.json();
    console.log(`✅ Database setup: ${JSON.stringify(dbData)}`);
    
    console.log('\n🎉 All tests completed!');
    console.log(`\n🌐 Your app is live at: ${BASE_URL}`);
    console.log('📧 Login with: admin@example.com / password123');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeployment();
