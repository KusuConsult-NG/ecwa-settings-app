import { NextResponse } from 'next/server';
import { createUser, createAuthResponse } from '@/lib/file-auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password, name, phone, address } = await req.json();
    console.log('📝 FILE SIGNUP: Creating user for email:', email);

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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('📝 FILE SIGNUP: Password hashed');

    // Create user
    const user = createUser({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      passwordHash,
      role: 'Secretary', // Default role
      orgId: crypto.randomUUID(),
      orgName: 'ECWA Organization',
      isActive: true
    });

    console.log('✅ FILE SIGNUP: User created successfully:', user.email);
    
    // Create response with cookie
    return await createAuthResponse(user);

  } catch (error) {
    console.error('❌ FILE SIGNUP: Error:', error);
    
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json({ 
        error: 'User already exists with this email',
        code: 'USER_EXISTS'
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Signup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
