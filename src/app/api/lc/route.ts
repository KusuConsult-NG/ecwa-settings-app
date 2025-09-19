import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import crypto from 'crypto';

// Interface moved to @/lib/lc
interface LCRecord {
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
  parentLCC?: string;
  parentLCCName?: string;
  childOrganizations: string[];
  facilities: string[];
  services: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

// GET /api/lc - Get all LC records
export async function GET(req: NextRequest) {
  try {
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

    const lcData = await kv.get('lc:index');
    let lcRecords: LCRecord[] = lcData ? JSON.parse(lcData) : [];

    lcRecords = lcRecords.filter(l => l.orgId === payload.orgId);

    if (status) lcRecords = lcRecords.filter(l => l.status === status);
    if (type) lcRecords = lcRecords.filter(l => l.type === type);
    if (state) lcRecords = lcRecords.filter(l => l.state.toLowerCase().includes(state.toLowerCase()));
    if (city) lcRecords = lcRecords.filter(l => l.city.toLowerCase().includes(city.toLowerCase()));
    if (search) {
      const searchLower = search.toLowerCase();
      lcRecords = lcRecords.filter(l =>
        l.name.toLowerCase().includes(searchLower) ||
        l.code.toLowerCase().includes(searchLower) ||
        l.address.toLowerCase().includes(searchLower) ||
        l.pastor.name.toLowerCase().includes(searchLower)
      );
    }

    lcRecords.sort((a, b) => a.name.localeCompare(b.name));

    const summary = {
      total: lcRecords.length,
      active: lcRecords.filter(l => l.status === 'active').length,
      inactive: lcRecords.filter(l => l.status === 'inactive').length,
      suspended: lcRecords.filter(l => l.status === 'suspended').length,
      closed: lcRecords.filter(l => l.status === 'closed').length,
      totalMembers: lcRecords.reduce((sum, l) => sum + l.currentMembers, 0),
      totalCapacity: lcRecords.reduce((sum, l) => sum + l.capacity, 0)
    };

    return NextResponse.json({ lcRecords, summary });

  } catch (error) {
    console.error('Get LC records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/lc - Create new LC record
export async function POST(req: NextRequest) {
  try {
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
      name, code, address, city, state, country, phone, email, website,
      establishedDate, type, capacity, currentMembers, pastor, leadership,
      parentLCC, facilities, services
    } = body;

    if (!name || !code || !address || !city || !state || !country || !phone || !email || !establishedDate || !type || !capacity || !pastor) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validTypes = ['urban', 'rural', 'suburban'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be urban, rural, or suburban' }, { status: 400 });
    }

    const lcData = await kv.get('lc:index');
    const existingLC: LCRecord[] = lcData ? JSON.parse(lcData) : [];
    
    const codeExists = existingLC.some(l => 
      l.code.toLowerCase() === code.toLowerCase() && l.orgId === payload.orgId
    );

    if (codeExists) {
      return NextResponse.json({ error: 'LC with this code already exists' }, { status: 409 });
    }

    const lc: LCRecord = {
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
      parentLCC: parentLCC || '',
      parentLCCName: parentLCC || '',
      childOrganizations: [],
      facilities: Array.isArray(facilities) ? facilities.map(f => f.trim()).filter(f => f) : [],
      services: Array.isArray(services) ? services.map(s => s.trim()).filter(s => s) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    await kv.set(`lc:${lc.id}`, JSON.stringify(lc));
    existingLC.push(lc);
    await kv.set('lc:index', JSON.stringify(existingLC));

    return NextResponse.json({
      success: true,
      lc,
      message: 'LC created successfully'
    });

  } catch (error) {
    console.error('Create LC error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
