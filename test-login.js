// Simple test script to verify login functionality
const testLogin = async () => {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing authentication...');
    
    // Step 1: Create test user
    console.log('1. Creating test user...');
    const testUserResponse = await fetch(`${baseUrl}/api/test-auth`);
    const testUserData = await testUserResponse.json();
    console.log('✅ Test user result:', testUserData);
    
    // Step 2: Test login
    console.log('2. Testing login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login result:', loginData);
    
    if (loginResponse.ok) {
      console.log('🎉 Login successful!');
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testLogin();
