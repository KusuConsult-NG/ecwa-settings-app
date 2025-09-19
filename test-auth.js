// Test authentication system
const testAuth = async () => {
  try {
    console.log('Testing authentication system...')
    
    // Test 1: Check if test user exists
    console.log('\n1. Testing user creation...')
    const createResponse = await fetch('http://localhost:3000/api/test-auth')
    const createData = await createResponse.json()
    console.log('Create user response:', createData)
    
    // Test 2: Try to login with test user
    console.log('\n2. Testing login...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('Login response status:', loginResponse.status)
    console.log('Login response:', loginData)
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!')
      
      // Test 3: Check /api/me endpoint
      console.log('\n3. Testing /api/me endpoint...')
      const meResponse = await fetch('http://localhost:3000/api/me', {
        headers: {
          'Cookie': loginResponse.headers.get('set-cookie') || ''
        }
      })
      
      const meData = await meResponse.json()
      console.log('Me response status:', meResponse.status)
      console.log('Me response:', meData)
      
      if (meResponse.ok) {
        console.log('✅ /api/me endpoint working!')
      } else {
        console.log('❌ /api/me endpoint failed')
      }
    } else {
      console.log('❌ Login failed')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testAuth()
