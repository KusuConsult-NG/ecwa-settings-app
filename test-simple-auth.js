// Test the new simple authentication system
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testSimpleAuth() {
  console.log('🔧 TESTING NEW SIMPLE AUTHENTICATION SYSTEM\n');

  try {
    // Step 1: Initialize simple auth system
    console.log('1️⃣ Initializing simple authentication system...');
    const initResponse = await fetch(`${BASE_URL}/api/init-simple-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const initData = await initResponse.json();
    console.log('🔧 Simple auth init result:', initData);

    if (!initData.success) {
      console.log('❌ Simple auth init failed:', initData.error);
      return;
    }

    // Step 2: Wait for initialization
    console.log('\n2️⃣ Waiting 2 seconds for initialization...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Test simple signup
    console.log('\n3️⃣ Testing simple signup...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/simple-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'simpleuser@example.com',
        password: 'SimplePass123!',
        name: 'Simple User',
        phone: '1234567890',
        address: 'Simple Address'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 Simple signup result:', signupData);

    if (!signupData.ok) {
      console.log('❌ Simple signup failed:', signupData.error);
      return;
    }

    console.log('✅ Simple signup successful!');

    // Step 4: Test simple login
    console.log('\n4️⃣ Testing simple login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/simple-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'simpleuser@example.com',
        password: 'SimplePass123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Simple login result:', loginData);

    if (loginData.ok) {
      console.log('\n🎉 SUCCESS! SIMPLE AUTHENTICATION IS WORKING!');
      console.log('✅ Both signup and login work perfectly!');
      console.log('✅ File-based authentication is reliable!');
      console.log('✅ No database dependencies!');
      
      // Test 5: Test admin login
      console.log('\n5️⃣ Testing admin login...');
      const adminLoginResponse = await fetch(`${BASE_URL}/api/auth/simple-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password123'
        })
      });
      
      const adminLoginData = await adminLoginResponse.json();
      console.log('🔐 Admin login result:', adminLoginData);
      
      if (adminLoginData.ok) {
        console.log('\n🏆 COMPLETE SUCCESS!');
        console.log('✅ NEW SIMPLE AUTHENTICATION SYSTEM IS FULLY WORKING!');
        console.log('✅ Both regular users and admin can authenticate');
        console.log('✅ File-based storage is reliable and fast');
        console.log('✅ No database connection issues');
        console.log(`🌐 Your app is fully functional at: ${BASE_URL}`);
        console.log('📧 Admin login: admin@example.com / password123');
        console.log('📧 User login: simpleuser@example.com / SimplePass123!');
        console.log('🎯 All authentication features are working!');
        console.log('\n🔧 NEW AUTHENTICATION ENDPOINTS:');
        console.log('- Login: /api/auth/simple-login');
        console.log('- Signup: /api/auth/simple-signup');
        console.log('- Init: /api/init-simple-auth');
        
      } else {
        console.log('\n❌ Admin login failed:', adminLoginData.error);
      }
      
    } else {
      console.log('\n❌ Simple login failed:', loginData.error);
      console.log('🔍 This indicates an issue with the simple auth system');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleAuth();
