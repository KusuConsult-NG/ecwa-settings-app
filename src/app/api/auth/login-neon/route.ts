import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('🔐 NEON LOGIN: Attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔐 NEON LOGIN: Normalized email:', normalizedEmail);

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('❌ NEON LOGIN: DATABASE_URL not available');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Create direct Neon connection
    const sql = neon(process.env.DATABASE_URL);
    console.log('🔐 NEON LOGIN: Database connection created');

    // Look up user directly in the database
    console.log('🔐 NEON LOGIN: Looking up user in database...');
    const result = await sql`
      SELECT key, value FROM kv_store 
      WHERE key = ${`user:${normalizedEmail}`}
      LIMIT 1
    `;
    
    console.log('🔐 NEON LOGIN: Database result:', result.length > 0 ? 'User found' : 'User not found');
    
    if (result.length === 0) {
      console.log('❌ NEON LOGIN: No user found for email:', normalizedEmail);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = JSON.parse(result[0].value);
    console.log('🔐 NEON LOGIN: User found:', { email: user.email, name: user.name, isActive: user.isActive });

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ NEON LOGIN: User account is deactivated');
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    // Verify password
    console.log('🔐 NEON LOGIN: Verifying password...');
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log('🔐 NEON LOGIN: Password verification result:', ok);
    
    if (!ok) {
      console.log('❌ NEON LOGIN: Password verification failed');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    
    // Update user in database
    console.log('🔐 NEON LOGIN: Updating user last login...');
    await sql`
      UPDATE kv_store 
      SET value = ${JSON.stringify(user)}, updated_at = NOW()
      WHERE key = ${`user:${normalizedEmail}`}
    `;

    // Generate JWT token
    console.log('🔐 NEON LOGIN: Generating JWT token...');
    const token = await signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      orgName: user.orgName,
      role: user.role
    });

    console.log('✅ NEON LOGIN: Login successful for:', user.email);

    // Set secure cookie
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

    response.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('❌ NEON LOGIN: Error:', error);
    return NextResponse.json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
