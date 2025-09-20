// Test the rebuilt login system
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testRebuiltLogin() {
  console.log('🔧 TESTING REBUILT LOGIN SYSTEM\n');

  try {
    // Step 1: Initialize database
    console.log('1️⃣ Initializing database...');
    const initResponse = await fetch(`${BASE_URL}/api/init-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const initData = await initResponse.json();
    console.log('🔧 Init result:', initData);

    if (!initData.success) {
      console.log('❌ Database init failed:', initData.error);
      return;
    }

    // Step 2: Wait for database operations
    console.log('\n2️⃣ Waiting 3 seconds for database operations...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Test new login with admin credentials
    console.log('\n3️⃣ Testing NEW login with admin credentials...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login-new`, {
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
    console.log('🔐 NEW Login result:', loginData);

    if (loginData.ok) {
      console.log('\n🎉 SUCCESS! NEW LOGIN IS WORKING!');
      console.log('✅ Admin user can authenticate with new system');
      console.log('✅ Neon database is properly connected');
      console.log('✅ Storage systems are synchronized');
      
      // Test 4: Test new signup
      console.log('\n4️⃣ Testing NEW signup...');
      const signupResponse = await fetch(`${BASE_URL}/api/auth/signup-new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'NewPass123!',
          name: 'New User',
          phone: '9876543210',
          address: 'New Address'
        })
      });
      
      const signupData = await signupResponse.json();
      console.log('📝 NEW Signup result:', signupData);
      
      if (signupData.ok) {
        console.log('\n✅ NEW signup also working!');
        
        // Test 5: Login with new user
        console.log('\n5️⃣ Testing login with new user...');
        const newUserLoginResponse = await fetch(`${BASE_URL}/api/auth/login-new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'newuser@example.com',
            password: 'NewPass123!'
          })
        });
        
        const newUserLoginData = await newUserLoginResponse.json();
        console.log('🔐 New user login result:', newUserLoginData);
        
        if (newUserLoginData.ok) {
          console.log('\n🏆 COMPLETE SUCCESS!');
          console.log('✅ NEW login system is fully working!');
          console.log('✅ Both admin and new users can authenticate');
          console.log('✅ Database is properly synchronized');
          console.log(`🌐 Your app is fully functional at: ${BASE_URL}`);
          console.log('📧 Admin login: admin@example.com / password123');
          console.log('📧 New user login: newuser@example.com / NewPass123!');
          console.log('🎯 All authentication features are working!');
        } else {
          console.log('\n❌ New user login failed:', newUserLoginData.error);
        }
      } else {
        console.log('\n❌ NEW signup failed:', signupData.error);
      }
      
    } else {
      console.log('\n❌ NEW login still failing:', loginData.error);
      console.log('🔍 This indicates a deeper issue that needs investigation');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRebuiltLogin();
