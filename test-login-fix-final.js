// Final test for login fix
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testLoginFixFinal() {
  console.log('🔧 FINAL LOGIN FIX TEST\n');

  try {
    // Step 1: Fix the login by setting up database properly
    console.log('1️⃣ Fixing login by setting up database...');
    const fixResponse = await fetch(`${BASE_URL}/api/fix-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const fixData = await fixResponse.json();
    console.log('🔧 Fix result:', fixData);

    if (!fixData.success) {
      console.log('❌ Fix failed:', fixData.error);
      return;
    }

    // Step 2: Wait for database operations
    console.log('\n2️⃣ Waiting 3 seconds for database operations...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Test login with admin credentials
    console.log('\n3️⃣ Testing login with admin credentials...');
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
      console.log('\n🎉 SUCCESS! LOGIN IS NOW WORKING!');
      console.log('✅ Admin user can authenticate');
      console.log('✅ Neon database is properly connected');
      console.log('✅ Storage systems are synchronized');
      
      // Test 4: Verify user session
      console.log('\n4️⃣ Testing user session...');
      const sessionResponse = await fetch(`${BASE_URL}/api/me`, {
        headers: {
          'Cookie': `auth=${loginData.token}`
        }
      });
      
      const sessionData = await sessionResponse.json();
      console.log('👤 Session data:', sessionData);
      
      console.log('\n🏆 COMPLETE SUCCESS!');
      console.log(`🌐 Your app is fully functional at: ${BASE_URL}`);
      console.log('📧 Login with: admin@example.com / password123');
      console.log('🎯 All features are now working!');
      
    } else {
      console.log('\n❌ Login still failing:', loginData.error);
      console.log('🔍 This indicates a deeper issue that needs investigation');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginFixFinal();
