import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';
import { kv, type UserRecord } from '@/lib/kv';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);

    // Look up user in KV store
    const userData = await kv.get(`user:${normalizedEmail}`);
    console.log('User data found:', !!userData);
    
    if (!userData) {
      console.log('No user found for email:', normalizedEmail);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user: UserRecord = JSON.parse(userData);
    console.log('User found:', { email: user.email, name: user.name, isActive: user.isActive });

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is deactivated');
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    // Verify password
    console.log('Verifying password...');
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log('Password verification result:', ok);
    
    if (!ok) {
      console.log('Password verification failed');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await kv.set(`user:${normalizedEmail}`, JSON.stringify(user));

    // Generate JWT token
    const token = await signJwt({ 
      sub: user.id, 
      role: user.role, 
      email: user.email, 
      name: user.name,
      orgId: user.orgId,
      orgName: user.orgName
    });

    // Create response
    const res = NextResponse.json({ 
      ok: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        orgId: user.orgId,
        orgName: user.orgName
      }
    });

    // Set authentication cookie
    res.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}