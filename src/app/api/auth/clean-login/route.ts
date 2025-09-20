import { NextResponse } from 'next/server';
import { signJwt } from '@/lib/auth';
import { cleanDb } from '@/lib/clean-db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('🔐 CLEAN LOGIN: Attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Authenticate user using clean database
    const user = await cleanDb.authenticateUser(email, password);
    
    if (!user) {
      console.log('❌ CLEAN LOGIN: Authentication failed for:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('✅ CLEAN LOGIN: Authentication successful for:', user.email);
    
    // Generate JWT token
    const token = await signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
      orgName: user.orgName
    });

    // Create response
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
        orgName: user.orgName
      }
    });

    // Set authentication cookie
    response.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('❌ CLEAN LOGIN: Error:', error);
    return NextResponse.json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
