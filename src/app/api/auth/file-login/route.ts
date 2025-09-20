import { NextResponse } from 'next/server';
import { authenticateUser, createAuthResponse } from '@/lib/file-auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('🔐 FILE LOGIN: Attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Authenticate user
    const user = await authenticateUser(email, password);
    
    if (!user) {
      console.log('❌ FILE LOGIN: Authentication failed for:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('✅ FILE LOGIN: Authentication successful for:', user.email);
    
    // Create response with cookie
    return await createAuthResponse(user);

  } catch (error) {
    console.error('❌ FILE LOGIN: Error:', error);
    return NextResponse.json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
