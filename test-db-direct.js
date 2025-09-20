// Test database connection directly
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testDatabaseDirect() {
  console.log('🔍 TESTING DATABASE CONNECTION DIRECTLY\n');

  try {
    // Test 1: Check if we can access the app
    console.log('1️⃣ Testing app accessibility...');
    const appResponse = await fetch(BASE_URL);
    console.log(`✅ App status: ${appResponse.status}`);

    // Test 2: Try to create a user
    console.log('\n2️⃣ Creating a test user...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dbtest@example.com',
        password: 'DbTest123!',
        name: 'DB Test User',
        phone: '1234567890',
        address: 'DB Test Address'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 Signup result:', signupData);

    if (signupData.ok) {
      console.log('\n✅ User creation is working!');
      
      // Test 3: Wait a moment for database operations
      console.log('\n3️⃣ Waiting 3 seconds for database operations...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test 4: Try to login with the new user
      console.log('\n4️⃣ Testing login with new user...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'dbtest@example.com',
          password: 'DbTest123!'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('🔐 Login result:', loginData);
      
      if (loginData.ok) {
        console.log('\n🎉 SUCCESS! LOGIN IS NOW WORKING!');
        console.log('✅ Both signup and login are working!');
        console.log('✅ Database synchronization is fixed!');
        console.log(`🌐 Your app is fully functional at: ${BASE_URL}`);
        console.log('📧 You can now create users and login with them!');
        
      } else {
        console.log('\n❌ Login still failing:', loginData.error);
        console.log('🔍 This indicates the database sync issue persists');
      }
      
    } else {
      console.log('\n❌ User creation failed:', signupData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabaseDirect();
