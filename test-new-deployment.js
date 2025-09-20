// Test script for new Vercel deployment
const baseUrl = 'https://ecwa-settings-app-v2.vercel.app';

async function testNewDeployment() {
  console.log('🚀 TESTING NEW VERCEL DEPLOYMENT');
  console.log('================================\n');

  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    const testResponse = await fetch(`${baseUrl}/api/test-vercel`);
    const testData = await testResponse.json();
    console.log('✅ Basic test:', testData.success ? 'SUCCESS' : 'FAILED');
    if (testData.success) {
      console.log('   Message:', testData.message);
      console.log('   Cache cleared:', testData.cacheCleared);
    }

    // Test 2: Initialize new auth system
    console.log('\n2️⃣ Testing new authentication system...');
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

    // Test 3: Test admin login
    console.log('\n3️⃣ Testing admin login...');
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

    // Test 4: Test clean auth system
    console.log('\n4️⃣ Testing clean authentication system...');
    const cleanInitResponse = await fetch(`${baseUrl}/api/init-clean`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const cleanInitData = await cleanInitResponse.json();
    console.log('✅ Clean init result:', cleanInitData.success ? 'SUCCESS' : 'FAILED');

    // Test 5: Test MongoDB (if configured)
    console.log('\n5️⃣ Testing MongoDB system...');
    const mongoInitResponse = await fetch(`${baseUrl}/api/init-mongo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const mongoInitData = await mongoInitResponse.json();
    console.log('✅ MongoDB result:', mongoInitData.success ? 'SUCCESS' : 'FAILED');
    if (!mongoInitData.success) {
      console.log('   Error:', mongoInitData.error);
      console.log('   Note: Add MONGODB_URI environment variable');
    }

    // Summary
    console.log('\n📊 DEPLOYMENT TEST SUMMARY:');
    console.log('✅ Basic connectivity:', testData.success ? 'WORKING' : 'FAILED');
    console.log('✅ New Auth System:', initData.success ? 'WORKING' : 'FAILED');
    console.log('✅ Admin Login:', loginData.success ? 'WORKING' : 'FAILED');
    console.log('✅ Clean Auth:', cleanInitData.success ? 'WORKING' : 'FAILED');
    console.log('✅ MongoDB:', mongoInitData.success ? 'WORKING' : 'NEEDS CONFIG');

    const allWorking = testData.success && initData.success && loginData.success && cleanInitData.success;
    
    if (allWorking) {
      console.log('\n🎉 NEW DEPLOYMENT IS WORKING PERFECTLY!');
      console.log('✅ Vercel cache issue resolved');
      console.log('✅ All authentication systems functional');
      console.log('✅ Ready for production use');
      console.log(`\n🔗 Your new app: ${baseUrl}`);
    } else {
      console.log('\n⚠️ Some tests failed - check the errors above');
      console.log('💡 Most likely need to add environment variables');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if deployment is complete');
    console.log('2. Verify the URL is correct');
    console.log('3. Check Vercel deployment logs');
    console.log('4. Add environment variables if needed');
  }
}

testNewDeployment();
