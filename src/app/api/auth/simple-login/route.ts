import { NextResponse } from 'next/server';
import { authenticateUser, createAuthResponse } from '@/lib/simple-auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('🔐 SIMPLE LOGIN: Attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Authenticate user
    const user = await authenticateUser(email, password);
    
    if (!user) {
      console.log('❌ SIMPLE LOGIN: Authentication failed for:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('✅ SIMPLE LOGIN: Authentication successful for:', user.email);
    
    // Create response with cookie
    return createAuthResponse(user);

  } catch (error) {
    console.error('❌ SIMPLE LOGIN: Error:', error);
    return NextResponse.json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
