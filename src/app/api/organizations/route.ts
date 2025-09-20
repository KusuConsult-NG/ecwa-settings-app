import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { Organization, OrganizationLevel, Leader, AgencyGroup } from '@/lib/organization';
import { createVerificationData, sendVerificationEmail, getEmailTemplate } from '@/lib/email-verification';
import crypto from 'crypto';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/organizations - Get all organizations
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

    // Get all organizations
    const orgsData = await kv.get('organizations:index');
    const organizations: Organization[] = orgsData ? JSON.parse(orgsData) : [];

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/organizations - Create new organization
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
      name, 
      level, 
      parentId, 
      secretaryDetails 
    } = body;

    // Validate required fields
    if (!name || !level || !secretaryDetails) {
      return NextResponse.json({ 
        error: 'Name, level, and secretary details are required' 
      }, { status: 400 });
    }

    // Validate organization level
    const validLevels: OrganizationLevel[] = ['GCC', 'DCC', 'LCC', 'LC', 'PrayerHouse'];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ 
        error: 'Invalid organization level' 
      }, { status: 400 });
    }

    // Check if user has permission to create this level
    const userRole = payload.role as string;
    const userOrgId = payload.orgId as string;
    
    // Only GCC Secretary can create DCC, DCC Secretary can create LCC, etc.
    if (level === 'DCC' && userRole !== 'GCC Secretary') {
      return NextResponse.json({ 
        error: 'Only GCC Secretary can create DCC organizations' 
      }, { status: 403 });
    }

    // Create organization
    const organization: Organization = {
      id: crypto.randomUUID(),
      name,
      level,
      parentId: parentId || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      createdByName: payload.name as string
    };

    // Create secretary leader
    const { code, expiresAt } = createVerificationData();
    const secretary: Leader = {
      id: crypto.randomUUID(),
      title: secretaryDetails.title,
      firstName: secretaryDetails.firstName,
      surname: secretaryDetails.surname,
      otherNames: secretaryDetails.otherNames,
      email: secretaryDetails.email,
      phone: secretaryDetails.phone,
      position: secretaryDetails.position,
      organizationId: organization.id,
      organizationLevel: level,
      verificationCode: code,
      verificationStatus: 'pending',
      verificationExpiry: expiresAt,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update organization with secretary info
    organization.secretaryId = secretary.id;
    organization.secretaryName = `${secretary.firstName} ${secretary.surname}`;

    // Save to storage
    await kv.set(`organization:${organization.id}`, JSON.stringify(organization));
    await kv.set(`leader:${secretary.id}`, JSON.stringify(secretary));

    // Update organizations index
    const orgsData = await kv.get('organizations:index');
    const organizations: Organization[] = orgsData ? JSON.parse(orgsData) : [];
    organizations.push(organization);
    await kv.set('organizations:index', JSON.stringify(organizations));

    // Send verification email to secretary
    const emailTemplate = getEmailTemplate('leader_verification', {
      leaderName: `${secretary.firstName} ${secretary.surname}`,
      organizationName: organization.name,
      code,
      position: secretary.position
    });

    await sendVerificationEmail(secretary.email, emailTemplate);

    return NextResponse.json({ 
      success: true, 
      organization,
      secretary: {
        id: secretary.id,
        name: `${secretary.firstName} ${secretary.surname}`,
        email: secretary.email,
        position: secretary.position
      },
      message: 'Organization created successfully. Verification code sent to secretary.'
    });

  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
