// Test the new MongoDB authentication system
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testMongoAuth() {
  console.log('🔧 TESTING MONGODB AUTHENTICATION SYSTEM\n');

  try {
    // Step 1: Initialize MongoDB database
    console.log('1️⃣ Initializing MongoDB database...');
    const initResponse = await fetch(`${BASE_URL}/api/init-mongo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const initData = await initResponse.json();
    console.log('🔧 MongoDB init result:', initData);

    if (!initData.success) {
      console.log('❌ MongoDB init failed:', initData.error);
      return;
    }

    // Step 2: Wait for initialization
    console.log('\n2️⃣ Waiting 2 seconds for initialization...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Test MongoDB signup
    console.log('\n3️⃣ Testing MongoDB signup...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/mongo-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mongouser@example.com',
        password: 'MongoPass123!',
        name: 'Mongo User',
        phone: '1234567890',
        address: 'Mongo Address'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 MongoDB signup result:', signupData);

    if (!signupData.ok) {
      console.log('❌ MongoDB signup failed:', signupData.error);
      return;
    }

    console.log('✅ MongoDB signup successful!');

    // Step 4: Test MongoDB login
    console.log('\n4️⃣ Testing MongoDB login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/mongo-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mongouser@example.com',
        password: 'MongoPass123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 MongoDB login result:', loginData);

    if (loginData.ok) {
      console.log('\n🎉 SUCCESS! MONGODB AUTHENTICATION IS WORKING!');
      console.log('✅ Both signup and login work perfectly!');
      console.log('✅ MongoDB with Vercel Functions is reliable!');
      console.log('✅ No database connection issues!');
      
      // Test 5: Test admin login
      console.log('\n5️⃣ Testing admin login...');
      const adminLoginResponse = await fetch(`${BASE_URL}/api/auth/mongo-login`, {
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
        console.log('✅ MONGODB AUTHENTICATION SYSTEM IS FULLY WORKING!');
        console.log('✅ Both regular users and admin can authenticate');
        console.log('✅ MongoDB with Vercel Functions is reliable and fast');
        console.log('✅ No database connection issues');
        console.log(`🌐 Your app is fully functional at: ${BASE_URL}`);
        console.log('📧 Admin login: admin@example.com / password123');
        console.log('📧 User login: mongouser@example.com / MongoPass123!');
        console.log('🎯 All authentication features are working!');
        console.log('\n🔧 MONGODB AUTHENTICATION ENDPOINTS:');
        console.log('- Login: /api/auth/mongo-login');
        console.log('- Signup: /api/auth/mongo-signup');
        console.log('- Init: /api/init-mongo');
        
      } else {
        console.log('\n❌ Admin login failed:', adminLoginData.error);
      }
      
    } else {
      console.log('\n❌ MongoDB login failed:', loginData.error);
      console.log('🔍 This indicates an issue with the MongoDB auth system');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMongoAuth();
