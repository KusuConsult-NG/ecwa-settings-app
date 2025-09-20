import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';
import { sql } from '@/lib/database';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password, name, phone, address } = await req.json();
    console.log('📝 NEW SIGNUP: Creating user for email:', email);

    if (!email || !password || !name || !phone || !address) {
      return NextResponse.json({ 
        error: 'Name, email, phone, address, and password are required',
        code: 'MISSING_FIELDS'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long',
        code: 'WEAK_PASSWORD',
        details: ['At least 8 characters']
      }, { status: 400 });
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ 
        error: 'Password must contain at least one uppercase letter',
        code: 'WEAK_PASSWORD',
        details: ['One uppercase letter']
      }, { status: 400 });
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ 
        error: 'Password must contain at least one lowercase letter',
        code: 'WEAK_PASSWORD',
        details: ['One lowercase letter']
      }, { status: 400 });
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ 
        error: 'Password must contain at least one number',
        code: 'WEAK_PASSWORD',
        details: ['One number']
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!sql) {
      console.log('❌ NEW SIGNUP: Database not available');
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Check if user already exists
    console.log('📝 NEW SIGNUP: Checking if user exists...');
    const existingUser = await sql`
      SELECT key FROM kv_store 
      WHERE key = ${`user:${normalizedEmail}`}
      LIMIT 1
    `;
    
    if (existingUser.length > 0) {
      console.log('❌ NEW SIGNUP: User already exists');
      return NextResponse.json({ 
        error: 'User already exists',
        code: 'USER_EXISTS'
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('📝 NEW SIGNUP: Password hashed');

    // Create user object
    const userId = crypto.randomUUID();
    const orgId = crypto.randomUUID();
    
    const user = {
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orgId: orgId,
      orgName: 'ECWA Organization',
      role: 'Secretary', // Default role
      isActive: true,
      lastLogin: null
    };

    // Store user in database
    console.log('📝 NEW SIGNUP: Storing user in database...');
    await sql`
      INSERT INTO kv_store (key, value, created_at, updated_at)
      VALUES (${`user:${normalizedEmail}`}, ${JSON.stringify(user)}, NOW(), NOW())
    `;
    console.log('✅ NEW SIGNUP: User stored successfully');

    // Generate JWT token
    const token = await signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId
    });

    console.log('✅ NEW SIGNUP: User created successfully:', user.email);

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
    console.error('❌ NEW SIGNUP: Error:', error);
    return NextResponse.json({ 
      error: 'Signup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
