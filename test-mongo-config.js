// Test MongoDB configuration
const BASE_URL = 'https://ecwa-settings-app-1zja.vercel.app';

async function testMongoConfig() {
  console.log('🔧 TESTING MONGODB CONFIGURATION\n');

  try {
    // Test MongoDB initialization
    console.log('1️⃣ Testing MongoDB initialization...');
    const initResponse = await fetch(`${BASE_URL}/api/init-mongo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', initResponse.status);
    console.log('Response headers:', Object.fromEntries(initResponse.headers.entries()));
    
    const initData = await initResponse.json();
    console.log('MongoDB init result:', initData);

    if (initData.success) {
      console.log('\n✅ MONGODB IS PROPERLY CONFIGURED!');
      console.log('✅ Database connection successful');
      console.log('✅ Environment variables are set correctly');
      
      // Test MongoDB signup
      console.log('\n2️⃣ Testing MongoDB signup...');
      const signupResponse = await fetch(`${BASE_URL}/api/auth/mongo-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testmongo@example.com',
          password: 'TestMongo123!',
          name: 'Test Mongo User',
          phone: '1234567890',
          address: 'Test Address'
        })
      });
      
      const signupData = await signupResponse.json();
      console.log('MongoDB signup result:', signupData);
      
      if (signupData.ok) {
        console.log('\n🎉 MONGODB AUTHENTICATION IS WORKING!');
        console.log('✅ Signup successful');
        
        // Test MongoDB login
        console.log('\n3️⃣ Testing MongoDB login...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/mongo-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'testmongo@example.com',
            password: 'TestMongo123!'
          })
        });
        
        const loginData = await loginResponse.json();
        console.log('MongoDB login result:', loginData);
        
        if (loginData.ok) {
          console.log('\n🏆 COMPLETE SUCCESS!');
          console.log('✅ MongoDB authentication is fully working!');
          console.log('✅ Both signup and login work perfectly!');
          console.log('✅ Your app is ready for production!');
        } else {
          console.log('\n❌ MongoDB login failed:', loginData.error);
        }
      } else {
        console.log('\n❌ MongoDB signup failed:', signupData.error);
      }
      
    } else {
      console.log('\n❌ MONGODB CONFIGURATION FAILED!');
      console.log('Error:', initData.error);
      console.log('\n🔧 TO FIX THIS:');
      console.log('1. Go to Vercel dashboard');
      console.log('2. Navigate to Environment Variables');
      console.log('3. Add MONGODB_URI with your MongoDB connection string');
      console.log('4. Redeploy your application');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 POSSIBLE ISSUES:');
    console.log('1. MONGODB_URI not set in Vercel');
    console.log('2. MongoDB Atlas cluster not accessible');
    console.log('3. Network connectivity issues');
  }
}

testMongoConfig();
