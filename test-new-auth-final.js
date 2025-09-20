// Test the new authentication system that bypasses Vercel middleware cache
const baseUrl = 'https://ecwa-settings-app-1zja.vercel.app';

async function testNewAuth() {
  console.log('🔧 TESTING NEW AUTH SYSTEM (BYPASSES VERCEL CACHE)\n');

  try {
    // Test 1: Initialize system
    console.log('1️⃣ Testing initialization...');
    const initResponse = await fetch(`${baseUrl}/api/init-new-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const initData = await initResponse.json();
    console.log('✅ Init result:', initData.success ? 'SUCCESS' : 'FAILED');
    if (initData.success) {
      console.log('   Features:', initData.features.join(', '));
      console.log('   Users:', initData.users);
    }

    // Test 2: Test admin login
    console.log('\n2️⃣ Testing admin login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/new-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ecwa.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login result:', loginData.success ? 'SUCCESS' : 'FAILED');
    if (loginData.success) {
      console.log('   User:', loginData.user.name, `(${loginData.user.role})`);
    }

    // Test 3: Test signup
    console.log('\n3️⃣ Testing signup...');
    const signupResponse = await fetch(`${baseUrl}/api/auth/new-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@ecwa.com',
        password: 'testpass123',
        name: 'Test User',
        role: 'member'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('✅ Signup result:', signupData.success ? 'SUCCESS' : 'FAILED');
    if (signupData.success) {
      console.log('   User:', signupData.user.name, `(${signupData.user.role})`);
    }

    // Test 4: Test new user login
    console.log('\n4️⃣ Testing new user login...');
    const newLoginResponse = await fetch(`${baseUrl}/api/auth/new-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@ecwa.com',
        password: 'testpass123'
      })
    });
    
    const newLoginData = await newLoginResponse.json();
    console.log('✅ New user login result:', newLoginData.success ? 'SUCCESS' : 'FAILED');
    if (newLoginData.success) {
      console.log('   User:', newLoginData.user.name, `(${newLoginData.user.role})`);
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('✅ Initialization:', initData.success ? 'WORKING' : 'FAILED');
    console.log('✅ Admin Login:', loginData.success ? 'WORKING' : 'FAILED');
    console.log('✅ Signup:', signupData.success ? 'WORKING' : 'FAILED');
    console.log('✅ New User Login:', newLoginData.success ? 'WORKING' : 'FAILED');

    const allWorking = initData.success && loginData.success && signupData.success && newLoginData.success;
    
    if (allWorking) {
      console.log('\n🎉 NEW AUTH SYSTEM IS WORKING ON VERCEL!');
      console.log('✅ Bypassed Vercel middleware cache');
      console.log('✅ All authentication features working');
      console.log('✅ Ready for production use');
    } else {
      console.log('\n❌ Some tests failed - check the errors above');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if the app is deployed to Vercel');
    console.log('2. Verify the base URL is correct');
    console.log('3. Check Vercel deployment logs');
  }
}

testNewAuth();
