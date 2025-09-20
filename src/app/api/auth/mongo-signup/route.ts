import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt, validateEmail, validatePassword } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { name, email, phone, address, password } = await req.json();
    console.log('📝 MONGO SIGNUP: Creating user for email:', email);

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

    // Get users collection
    const usersCollection = await getUsersCollection();
    console.log('📝 MONGO SIGNUP: Connected to MongoDB');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email', code: 'USER_EXISTS' }, 
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('📝 MONGO SIGNUP: Password hashed');

    // Create user document
    const user = {
      email: normalizedEmail,
      name: normalizedName,
      phone: normalizedPhone,
      address: normalizedAddress,
      passwordHash,
      role: 'Secretary', // Default role
      orgId: crypto.randomUUID(),
      orgName: 'ECWA Organization',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    // Insert user into MongoDB
    const result = await usersCollection.insertOne(user);
    console.log('📝 MONGO SIGNUP: User created with ID:', result.insertedId);

    // Generate JWT token
    const token = await signJwt({
      sub: result.insertedId.toString(),
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
        id: result.insertedId.toString(),
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log('✅ MONGO SIGNUP: User created successfully:', user.email);
    return response;

  } catch (error) {
    console.error('❌ MONGO SIGNUP: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' }, 
      { status: 500 }
    );
  }
}
