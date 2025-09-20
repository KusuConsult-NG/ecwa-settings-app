import { NextRequest, NextResponse } from 'next/server';
import { signJwt, verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { Leader, Organization } from '@/lib/organization';
import { validateVerificationCode } from '@/lib/email-verification';
import bcrypt from 'bcryptjs';

// POST /api/auth/verify-login - Login with email + verification code
export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ 
        error: 'Email and verification code are required' 
      }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find leader by email
    const leadersData = await kv.get('leaders:index');
    const leaders: Leader[] = leadersData ? JSON.parse(leadersData) : [];
    
    const leader = leaders.find(l => l.email.toLowerCase() === normalizedEmail);
    
    if (!leader) {
      return NextResponse.json({ 
        error: 'No leader found with this email' 
      }, { status: 404 });
    }

    // Check if leader is active
    if (!leader.isActive) {
      return NextResponse.json({ 
        error: 'Leader account is deactivated' 
      }, { status: 401 });
    }

    // Validate verification code
    const verification = {
      id: leader.id,
      email: leader.email,
      code: leader.verificationCode || '',
      type: 'leader_verification' as const,
      organizationId: leader.organizationId,
      leaderId: leader.id,
      expiresAt: leader.verificationExpiry || '',
      isUsed: leader.verificationStatus === 'verified',
      createdAt: leader.createdAt
    };

    const validation = validateVerificationCode(code, verification);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error || 'Invalid verification code' 
      }, { status: 401 });
    }

    // Get organization details
    const orgData = await kv.get(`organization:${leader.organizationId}`);
    const organization: Organization = orgData ? JSON.parse(orgData) : {
      id: leader.organizationId,
      name: 'ECWA Organization',
      level: leader.organizationLevel
    };

    // Update leader verification status and last login
    leader.verificationStatus = 'verified';
    leader.lastLogin = new Date().toISOString();
    leader.updatedAt = new Date().toISOString();

    // Save updated leader
    await kv.set(`leader:${leader.id}`, JSON.stringify(leader));

    // Update leaders index
    const updatedLeaders = leaders.map(l => 
      l.id === leader.id ? leader : l
    );
    await kv.set('leaders:index', JSON.stringify(updatedLeaders));

    // Generate JWT token
    const token = await signJwt({
      sub: leader.id,
      role: leader.position,
      email: leader.email,
      name: `${leader.firstName} ${leader.surname}`,
      orgId: organization.id,
      orgName: organization.name,
      organizationLevel: leader.organizationLevel
    });

    // Create response
    const res = NextResponse.json({
      ok: true,
      user: {
        id: leader.id,
        email: leader.email,
        name: `${leader.firstName} ${leader.surname}`,
        role: leader.position,
        orgId: organization.id,
        orgName: organization.name,
        organizationLevel: leader.organizationLevel,
        isFirstLogin: leader.verificationStatus === 'verified' && !leader.lastLogin
      },
      message: 'Login successful. Please complete your profile setup.'
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

  } catch (error) {
    console.error('Verify login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/auth/verify-login - Complete profile setup (update profile + set password)
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { password, firstName, surname, phone, address, dccId, lccId, lcId } = await req.json();

    // Validate required fields
    if (!password) {
      return NextResponse.json({ 
        error: 'Password is required' 
      }, { status: 400 });
    }

    if (!firstName || !surname) {
      return NextResponse.json({ 
        error: 'First name and surname are required' 
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get leader
    const leaderData = await kv.get(`leader:${payload.sub}`);
    if (!leaderData) {
      return NextResponse.json({ 
        error: 'Leader not found' 
      }, { status: 404 });
    }

    const leader: Leader = JSON.parse(leaderData);

    // Update leader with profile information and password
    leader.firstName = firstName.trim();
    leader.surname = surname.trim();
    leader.phone = phone?.trim() || undefined;
    leader.address = address?.trim() || undefined;
    leader.passwordHash = passwordHash;
    leader.updatedAt = new Date().toISOString();

    // Add organization affiliations
    leader.affiliations = {
      dccId: dccId || undefined,
      lccId: lccId || undefined,
      lcId: lcId || undefined
    };

    // Save updated leader
    await kv.set(`leader:${leader.id}`, JSON.stringify(leader));

    // Update leaders index
    const leadersData = await kv.get('leaders:index');
    const leaders: Leader[] = leadersData ? JSON.parse(leadersData) : [];
    const updatedLeaders = leaders.map(l => 
      l.id === leader.id ? leader : l
    );
    await kv.set('leaders:index', JSON.stringify(updatedLeaders));

    return NextResponse.json({
      success: true,
      message: 'Profile setup completed successfully',
      user: {
        id: leader.id,
        email: leader.email,
        name: `${leader.firstName} ${leader.surname}`,
        firstName: leader.firstName,
        surname: leader.surname,
        phone: leader.phone,
        address: leader.address,
        role: leader.position,
        orgId: leader.organizationId,
        organizationLevel: leader.organizationLevel
      }
    });

  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
