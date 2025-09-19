import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { Leader, OrganizationLevel, getAvailablePositions } from '@/lib/organization';
import { createVerificationData, sendVerificationEmail, getEmailTemplate } from '@/lib/email-verification';
import crypto from 'crypto';

// GET /api/leaders - Get all leaders
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const level = searchParams.get('level') as OrganizationLevel;

    // Get all leaders
    const leadersData = await kv.get('leaders:index');
    let leaders: Leader[] = leadersData ? JSON.parse(leadersData) : [];

    // Filter by organization if specified
    if (organizationId) {
      leaders = leaders.filter(leader => leader.organizationId === organizationId);
    }

    // Filter by level if specified
    if (level) {
      leaders = leaders.filter(leader => leader.organizationLevel === level);
    }

    return NextResponse.json({ leaders });
  } catch (error) {
    console.error('Get leaders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leaders - Add new leader
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title,
      firstName,
      surname,
      otherNames,
      email,
      phone,
      position,
      organizationId,
      organizationLevel
    } = body;

    // Validate required fields
    if (!title || !firstName || !surname || !email || !phone || !position || !organizationId || !organizationLevel) {
      return NextResponse.json({ 
        error: 'All leader details are required' 
      }, { status: 400 });
    }

    // Validate position for organization level
    const availablePositions = getAvailablePositions(organizationLevel);
    if (!availablePositions.includes(position)) {
      return NextResponse.json({ 
        error: `Invalid position for ${organizationLevel} level. Available positions: ${availablePositions.join(', ')}` 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingLeadersData = await kv.get('leaders:index');
    const existingLeaders: Leader[] = existingLeadersData ? JSON.parse(existingLeadersData) : [];
    
    const emailExists = existingLeaders.some(leader => 
      leader.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return NextResponse.json({ 
        error: 'A leader with this email already exists' 
      }, { status: 409 });
    }

    // Create verification data
    const { code, expiresAt } = createVerificationData();

    // Create leader
    const leader: Leader = {
      id: crypto.randomUUID(),
      title,
      firstName,
      surname,
      otherNames,
      email,
      phone,
      position,
      organizationId,
      organizationLevel,
      verificationCode: code,
      verificationStatus: 'pending',
      verificationExpiry: expiresAt,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save leader
    await kv.set(`leader:${leader.id}`, JSON.stringify(leader));

    // Update leaders index
    existingLeaders.push(leader);
    await kv.set('leaders:index', JSON.stringify(existingLeaders));

    // Get organization name for email
    const orgData = await kv.get(`organization:${organizationId}`);
    const organization = orgData ? JSON.parse(orgData) : { name: 'ECWA Organization' };

    // Send verification email
    const emailTemplate = getEmailTemplate('leader_verification', {
      leaderName: `${firstName} ${surname}`,
      organizationName: organization.name,
      code,
      position
    });

    await sendVerificationEmail(email, emailTemplate);

    return NextResponse.json({ 
      success: true, 
      leader: {
        id: leader.id,
        name: `${firstName} ${surname}`,
        email: leader.email,
        position: leader.position,
        organizationLevel: leader.organizationLevel
      },
      message: 'Leader added successfully. Verification code sent to email.'
    });

  } catch (error) {
    console.error('Add leader error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
