// Debug login issue comprehensively
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function debugLogin() {
  console.log('🔍 COMPREHENSIVE LOGIN DEBUG\n');

  try {
    // Step 1: Test signup (we know this works)
    console.log('1️⃣ Testing signup (should work)...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'debugtest@example.com',
        password: 'DebugTest123!',
        name: 'Debug Test User',
        phone: '1234567890',
        address: 'Debug Test Address'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 Signup result:', signupData);

    if (!signupData.ok) {
      console.log('❌ Signup failed, stopping test');
      return;
    }

    console.log('✅ Signup successful!');

    // Step 2: Wait for database operations
    console.log('\n2️⃣ Waiting 3 seconds for database operations...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Test login with the newly created user
    console.log('\n3️⃣ Testing login with newly created user...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'debugtest@example.com',
        password: 'DebugTest123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login result:', loginData);

    if (loginData.ok) {
      console.log('\n🎉 SUCCESS! LOGIN IS NOW WORKING!');
      console.log('✅ Users can now login after signup');
      console.log('✅ The login issue is fixed!');
      console.log(`🌐 Your app is fully functional at: ${BASE_URL}`);
      
    } else {
      console.log('\n❌ Login still failing:', loginData.error);
      console.log('🔍 This indicates the database sync issue persists');
      
      // Step 4: Test with admin user
      console.log('\n4️⃣ Testing with admin user...');
      const adminLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
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
        console.log('✅ Admin login works, but new user login fails');
        console.log('🔍 This suggests a data storage/retrieval issue');
      } else {
        console.log('❌ Even admin login fails');
        console.log('🔍 This suggests a fundamental login route issue');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

debugLogin();
