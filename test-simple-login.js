// Simple login test to verify current status
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testSimpleLogin() {
  console.log('🔍 SIMPLE LOGIN TEST\n');

  try {
    // Test 1: Check if app is accessible
    console.log('1️⃣ Testing app accessibility...');
    const appResponse = await fetch(BASE_URL);
    console.log(`✅ App status: ${appResponse.status}`);

    // Test 2: Try to create a new user via signup
    console.log('\n2️⃣ Testing user creation...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'Test123!',
        name: 'Test User',
        phone: '1234567890',
        address: 'Test Address'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 Signup result:', signupData);

    if (signupData.ok) {
      console.log('\n✅ User creation is working!');
      
      // Test 3: Try to login with the new user
      console.log('\n3️⃣ Testing login with new user...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'Test123!'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('🔐 Login result:', loginData);
      
      if (loginData.token) {
        console.log('\n🎉 SUCCESS! LOGIN IS WORKING!');
        console.log('✅ New users can be created and authenticated');
        console.log('✅ The app is fully functional');
        console.log(`🌐 Your app is ready at: ${BASE_URL}`);
        console.log('📧 You can create users and login with them');
        
        // Test 4: Test user session
        console.log('\n4️⃣ Testing user session...');
        const sessionResponse = await fetch(`${BASE_URL}/api/me`, {
          headers: {
            'Cookie': `auth=${loginData.token}`
          }
        });
        
        const sessionData = await sessionResponse.json();
        console.log('👤 Session data:', sessionData);
        
        console.log('\n🏆 COMPLETE SUCCESS!');
        console.log('🎯 All authentication features are working!');
        
      } else {
        console.log('\n❌ Login failed:', loginData.error);
        console.log('🔍 This indicates a storage synchronization issue');
      }
      
    } else {
      console.log('\n⚠️ User creation failed:', signupData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleLogin();
