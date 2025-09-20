// Test the new Neon-specific login system
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testNeonLogin() {
  console.log('🔧 TESTING NEW NEON LOGIN SYSTEM\n');

  try {
    // Step 1: Initialize Neon database
    console.log('1️⃣ Initializing Neon database...');
    const initResponse = await fetch(`${BASE_URL}/api/init-neon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const initData = await initResponse.json();
    console.log('🔧 Neon init result:', initData);

    if (!initData.success) {
      console.log('❌ Neon init failed:', initData.error);
      return;
    }

    // Step 2: Wait for database operations
    console.log('\n2️⃣ Waiting 3 seconds for database operations...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Test Neon login with admin credentials
    console.log('\n3️⃣ Testing Neon login with admin credentials...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login-neon`, {
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
    console.log('🔐 Neon login result:', loginData);

    if (loginData.ok) {
      console.log('\n🎉 SUCCESS! NEON LOGIN IS WORKING!');
      console.log('✅ Admin user can authenticate with Neon system');
      console.log('✅ Neon database is properly connected');
      console.log('✅ Direct Neon connection works!');
      
      // Test 4: Test Neon signup
      console.log('\n4️⃣ Testing Neon signup...');
      const signupResponse = await fetch(`${BASE_URL}/api/auth/signup-neon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'neonuser@example.com',
          password: 'NeonPass123!',
          name: 'Neon User',
          phone: '9876543210',
          address: 'Neon Address'
        })
      });
      
      const signupData = await signupResponse.json();
      console.log('📝 Neon signup result:', signupData);
      
      if (signupData.ok) {
        console.log('\n✅ Neon signup also working!');
        
        // Test 5: Login with new Neon user
        console.log('\n5️⃣ Testing login with new Neon user...');
        const newUserLoginResponse = await fetch(`${BASE_URL}/api/auth/login-neon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'neonuser@example.com',
            password: 'NeonPass123!'
          })
        });
        
        const newUserLoginData = await newUserLoginResponse.json();
        console.log('🔐 New Neon user login result:', newUserLoginData);
        
        if (newUserLoginData.ok) {
          console.log('\n🏆 COMPLETE SUCCESS!');
          console.log('✅ NEW NEON LOGIN SYSTEM IS FULLY WORKING!');
          console.log('✅ Both admin and new users can authenticate');
          console.log('✅ Direct Neon database connection works perfectly');
          console.log(`🌐 Your app is fully functional at: ${BASE_URL}`);
          console.log('📧 Admin login: admin@example.com / password123');
          console.log('📧 New user login: neonuser@example.com / NeonPass123!');
          console.log('🎯 All authentication features are working!');
          console.log('\n🔧 SOLUTION: Use these new endpoints:');
          console.log('- Login: /api/auth/login-neon');
          console.log('- Signup: /api/auth/signup-neon');
          console.log('- Init: /api/init-neon');
        } else {
          console.log('\n❌ New Neon user login failed:', newUserLoginData.error);
        }
      } else {
        console.log('\n❌ Neon signup failed:', signupData.error);
      }
      
    } else {
      console.log('\n❌ Neon login still failing:', loginData.error);
      console.log('🔍 This indicates a deeper issue with Neon connection');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNeonLogin();
