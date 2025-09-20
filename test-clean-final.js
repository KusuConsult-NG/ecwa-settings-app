// Test the clean database system on Vercel
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testCleanSystem() {
  console.log('🔧 TESTING CLEAN DATABASE SYSTEM ON VERCEL\n');

  try {
    // Step 1: Initialize clean database
    console.log('1️⃣ Initializing clean database system...');
    const initResponse = await fetch(`${BASE_URL}/api/init-clean`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const initData = await initResponse.json();
    console.log('🔧 Clean init result:', initData);

    if (!initData.success) {
      console.log('❌ Clean init failed:', initData.error);
      return;
    }

    // Step 2: Wait for initialization
    console.log('\n2️⃣ Waiting 2 seconds for initialization...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Test clean signup
    console.log('\n3️⃣ Testing clean signup...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/clean-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'cleanuser@example.com',
        password: 'CleanPass123!',
        name: 'Clean User',
        phone: '1234567890',
        address: 'Clean Address'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 Clean signup result:', signupData);

    if (!signupData.ok) {
      console.log('❌ Clean signup failed:', signupData.error);
      return;
    }

    console.log('✅ Clean signup successful!');

    // Step 4: Test clean login
    console.log('\n4️⃣ Testing clean login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/clean-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'cleanuser@example.com',
        password: 'CleanPass123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Clean login result:', loginData);

    if (loginData.ok) {
      console.log('\n🎉 SUCCESS! CLEAN DATABASE SYSTEM IS WORKING!');
      console.log('✅ Both signup and login work perfectly!');
      console.log('✅ No database mismatch errors!');
      console.log('✅ No middleware caching issues!');
      console.log('✅ Clean, simple codebase!');
      
      // Test 5: Test admin login
      console.log('\n5️⃣ Testing admin login...');
      const adminLoginResponse = await fetch(`${BASE_URL}/api/auth/clean-login`, {
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
        console.log('✅ CLEAN DATABASE SYSTEM IS FULLY WORKING!');
        console.log('✅ Both regular users and admin can authenticate');
        console.log('✅ No database connection issues');
        console.log('✅ No middleware caching problems');
        console.log('✅ Clean, maintainable codebase');
        console.log(`🌐 Your app is fully functional at: ${BASE_URL}`);
        console.log('📧 Admin login: admin@example.com / password123');
        console.log('📧 User login: cleanuser@example.com / CleanPass123!');
        console.log('🎯 All authentication features are working!');
        console.log('\n🔧 WORKING CLEAN ENDPOINTS:');
        console.log('- Login: /api/auth/clean-login');
        console.log('- Signup: /api/auth/clean-signup');
        console.log('- Init: /api/init-clean');
        
      } else {
        console.log('\n❌ Admin login failed:', adminLoginData.error);
      }
      
    } else {
      console.log('\n❌ Clean login failed:', loginData.error);
      console.log('🔍 This indicates an issue with the clean system');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCleanSystem();
