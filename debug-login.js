// Debug login issue
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function debugLogin() {
  console.log('🔍 Debugging login issue...\n');

  try {
    // Step 1: Create user
    console.log('1️⃣ Creating user...');
    const createResponse = await fetch(`${BASE_URL}/api/test-auth`);
    const createData = await createResponse.json();
    console.log('✅ User creation:', createData);

    // Step 2: Wait a moment
    console.log('\n2️⃣ Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Try login
    console.log('\n3️⃣ Attempting login...');
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
    console.log('❌ Login result:', loginData);

    // Step 4: Check if user exists in storage
    console.log('\n4️⃣ Checking user in storage...');
    const userCheckResponse = await fetch(`${BASE_URL}/api/me`);
    const userCheckData = await userCheckResponse.json();
    console.log('👤 User check:', userCheckData);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugLogin();
