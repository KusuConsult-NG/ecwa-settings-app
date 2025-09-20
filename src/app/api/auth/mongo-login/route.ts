import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('🔐 MONGO LOGIN: Attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔐 MONGO LOGIN: Normalized email:', normalizedEmail);

    // Get users collection
    const usersCollection = await getUsersCollection();
    console.log('🔐 MONGO LOGIN: Connected to MongoDB');

    // Find user by email
    const user = await usersCollection.findOne({ email: normalizedEmail });
    console.log('🔐 MONGO LOGIN: User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ MONGO LOGIN: No user found for email:', normalizedEmail);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ MONGO LOGIN: User account is deactivated');
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    // Verify password
    console.log('🔐 MONGO LOGIN: Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log('🔐 MONGO LOGIN: Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ MONGO LOGIN: Password verification failed');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    await usersCollection.updateOne(
      { email: normalizedEmail },
      { 
        $set: { 
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    );

    // Generate JWT token
    const token = await signJwt({ 
      sub: user._id.toString(), 
      role: user.role, 
      email: user.email, 
      name: user.name,
      orgId: user.orgId,
      orgName: user.orgName
    });

    // Create response
    const response = NextResponse.json({ 
      ok: true, 
      user: {
        id: user._id.toString(),
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log('✅ MONGO LOGIN: Authentication successful for:', user.email);
    return response;

  } catch (error) {
    console.error('❌ MONGO LOGIN: Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
