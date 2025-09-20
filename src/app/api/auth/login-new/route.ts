import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';
import { sql } from '@/lib/database';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('🔐 NEW LOGIN: Attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔐 NEW LOGIN: Normalized email:', normalizedEmail);

    if (!sql) {
      console.log('❌ NEW LOGIN: Database not available');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Look up user directly in the database
    console.log('🔐 NEW LOGIN: Looking up user in database...');
    const result = await sql`
      SELECT key, value FROM kv_store 
      WHERE key = ${`user:${normalizedEmail}`}
      LIMIT 1
    `;
    
    console.log('🔐 NEW LOGIN: Database result:', result.length > 0 ? 'User found' : 'User not found');
    
    if (result.length === 0) {
      console.log('❌ NEW LOGIN: No user found for email:', normalizedEmail);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = JSON.parse(result[0].value);
    console.log('🔐 NEW LOGIN: User found:', { email: user.email, name: user.name, isActive: user.isActive });

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ NEW LOGIN: User account is deactivated');
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    // Verify password
    console.log('🔐 NEW LOGIN: Verifying password...');
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log('🔐 NEW LOGIN: Password verification result:', ok);
    
    if (!ok) {
      console.log('❌ NEW LOGIN: Password verification failed');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    
    // Update user in database
    await sql`
      UPDATE kv_store 
      SET value = ${JSON.stringify(user)}, updated_at = NOW()
      WHERE key = ${`user:${normalizedEmail}`}
    `;

    // Generate JWT token
    const token = await signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId
    });

    console.log('✅ NEW LOGIN: Login successful for:', user.email);

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
    console.error('❌ NEW LOGIN: Error:', error);
    return NextResponse.json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
