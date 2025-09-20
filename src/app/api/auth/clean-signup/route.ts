import { NextResponse } from 'next/server';
import { signJwt, validateEmail, validatePassword } from '@/lib/auth';
import { cleanDb } from '@/lib/clean-db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { name, email, phone, address, password } = await req.json();
    console.log('📝 CLEAN SIGNUP: Creating user for email:', email);

    // Input validation
    if (!name || !email || !phone || !address || !password) {
      return NextResponse.json(
        { error: 'Name, email, phone, address, and password are required', code: 'MISSING_FIELDS' }, 
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' }, 
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements', 
          code: 'WEAK_PASSWORD',
          details: passwordValidation.errors
        }, 
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long', code: 'INVALID_NAME' }, 
        { status: 400 }
      );
    }

    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();
    const normalizedAddress = address.trim();

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('📝 CLEAN SIGNUP: Password hashed');

    // Create user using clean database
    const user = cleanDb.createUser({
      email: normalizedEmail,
      name: normalizedName,
      phone: normalizedPhone,
      address: normalizedAddress,
      passwordHash,
      role: 'Secretary', // Default role
      orgId: crypto.randomUUID(),
      orgName: 'ECWA Organization',
      isActive: true
    });

    console.log('✅ CLEAN SIGNUP: User created successfully:', user.email);

    // Generate JWT token
    const token = await signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      orgName: user.orgName,
      role: user.role
    });

    // Create response
    const response = NextResponse.json({ 
      ok: true, 
      user: { 
        id: user.id,
        name: user.name, 
        email: user.email,
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
    console.error('❌ CLEAN SIGNUP: Error:', error);
    
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json({ 
        error: 'User already exists with this email', 
        code: 'USER_EXISTS' 
      }, { status: 409 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' }, 
      { status: 500 }
    );
  }
}
