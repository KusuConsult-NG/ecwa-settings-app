import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import crypto from 'crypto';

export interface LCCRecord {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  establishedDate: string;
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  type: 'urban' | 'rural' | 'suburban';
  capacity: number;
  currentMembers: number;
  pastor: {
    name: string;
    email: string;
    phone: string;
  };
  leadership: {
    chairman: string;
    secretary: string;
    treasurer: string;
    youthLeader: string;
    womenLeader: string;
    menLeader: string;
  };
  parentOrganization?: string;
  parentOrganizationName?: string;
  childOrganizations: string[];
  facilities: string[];
  services: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

// GET /api/lcc - Get all LCC records
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    // Get LCC records from database
    const lccData = await kv.get('lcc:index');
    let lccRecords: LCCRecord[] = lccData ? JSON.parse(lccData) : [];

    // Filter by organization
    lccRecords = lccRecords.filter(l => l.orgId === payload.orgId);

    // Apply filters
    if (status) {
      lccRecords = lccRecords.filter(l => l.status === status);
    }

    if (type) {
      lccRecords = lccRecords.filter(l => l.type === type);
    }

    if (state) {
      lccRecords = lccRecords.filter(l => l.state.toLowerCase().includes(state.toLowerCase()));
    }

    if (city) {
      lccRecords = lccRecords.filter(l => l.city.toLowerCase().includes(city.toLowerCase()));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      lccRecords = lccRecords.filter(l =>
        l.name.toLowerCase().includes(searchLower) ||
        l.code.toLowerCase().includes(searchLower) ||
        l.address.toLowerCase().includes(searchLower) ||
        l.pastor.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort by name
    lccRecords.sort((a, b) => a.name.localeCompare(b.name));

    // Calculate summary statistics
    const summary = {
      total: lccRecords.length,
      active: lccRecords.filter(l => l.status === 'active').length,
      inactive: lccRecords.filter(l => l.status === 'inactive').length,
      suspended: lccRecords.filter(l => l.status === 'suspended').length,
      closed: lccRecords.filter(l => l.status === 'closed').length,
      totalMembers: lccRecords.reduce((sum, l) => sum + l.currentMembers, 0),
      totalCapacity: lccRecords.reduce((sum, l) => sum + l.capacity, 0)
    };

    return NextResponse.json({
      lccRecords,
      summary
    });

  } catch (error) {
    console.error('Get LCC records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/lcc - Create new LCC record
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      code,
      address,
      city,
      state,
      country,
      phone,
      email,
      website,
      establishedDate,
      type,
      capacity,
      currentMembers,
      pastor,
      leadership,
      parentOrganization,
      facilities,
      services
    } = body;

    // Validation
    if (!name || !code || !address || !city || !state || !country || !phone || !email || !establishedDate || !type || !capacity || !pastor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['urban', 'rural', 'suburban'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be urban, rural, or suburban' },
        { status: 400 }
      );
    }

    // Check if LCC code already exists
    const lccData = await kv.get('lcc:index');
    const existingLCC: LCCRecord[] = lccData ? JSON.parse(lccData) : [];
    
    const codeExists = existingLCC.some(l => 
      l.code.toLowerCase() === code.toLowerCase() && l.orgId === payload.orgId
    );

    if (codeExists) {
      return NextResponse.json(
        { error: 'LCC with this code already exists' },
        { status: 409 }
      );
    }

    // Create LCC record
    const lcc: LCCRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      website: website?.trim() || '',
      establishedDate,
      status: 'active',
      type,
      capacity: Number(capacity),
      currentMembers: Number(currentMembers) || 0,
      pastor: {
        name: pastor.name.trim(),
        email: pastor.email.trim().toLowerCase(),
        phone: pastor.phone.trim()
      },
      leadership: {
        chairman: leadership?.chairman?.trim() || '',
        secretary: leadership?.secretary?.trim() || '',
        treasurer: leadership?.treasurer?.trim() || '',
        youthLeader: leadership?.youthLeader?.trim() || '',
        womenLeader: leadership?.womenLeader?.trim() || '',
        menLeader: leadership?.menLeader?.trim() || ''
      },
      parentOrganization: parentOrganization || '',
      parentOrganizationName: parentOrganization || '',
      childOrganizations: [],
      facilities: Array.isArray(facilities) ? facilities.map(f => f.trim()).filter(f => f) : [],
      services: Array.isArray(services) ? services.map(s => s.trim()).filter(s => s) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save to database
    await kv.set(`lcc:${lcc.id}`, JSON.stringify(lcc));
    
    // Update LCC index
    existingLCC.push(lcc);
    await kv.set('lcc:index', JSON.stringify(existingLCC));

    return NextResponse.json({
      success: true,
      lcc,
      message: 'LCC created successfully'
    });

  } catch (error) {
    console.error('Create LCC error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
