import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

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

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not available');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Create direct Neon connection (same as signup)
    const sql = neon(process.env.DATABASE_URL);
    console.log('Database connection created');

    // Look up user directly in database
    console.log('Looking up user in database...');
    const result = await sql`
      SELECT key, value FROM kv_store 
      WHERE key = ${`user:${normalizedEmail}`}
      LIMIT 1
    `;
    
    console.log('Database result:', result.length > 0 ? 'User found' : 'User not found');
    
    if (result.length === 0) {
      console.log('No user found for email:', normalizedEmail);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = JSON.parse(result[0].value);
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
    user.updatedAt = new Date().toISOString();
    
    // Update user in database using the same connection
    await sql`
      UPDATE kv_store 
      SET value = ${JSON.stringify(user)}, updated_at = NOW()
      WHERE key = ${`user:${normalizedEmail}`}
    `;

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