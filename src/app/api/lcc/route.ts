import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { LCCRecord, CreateLCCRequest, generateLCCId } from '@/lib/lcc';
import crypto from 'crypto';

// GET /api/lcc - Get all LCC records
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.sub || !payload.orgId || !payload.orgName) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Get all LCC records from KV store
    const lccData = await kv.get('lcc:index');
    const allLCC: LCCRecord[] = lccData ? JSON.parse(lccData) : [];

    // Filter LCC records by organization
    let filteredLCC = allLCC.filter(lcc => lcc.orgId === (payload.orgId as string));

    // Apply additional filters
    if (status) {
      filteredLCC = filteredLCC.filter(lcc => lcc.status === status);
    }
    if (search) {
      filteredLCC = filteredLCC.filter(lcc => 
        lcc.name.toLowerCase().includes(search.toLowerCase()) ||
        lcc.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ lccs: filteredLCC });
  } catch (error) {
    console.error('LCC GET error:', error);
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
    if (!payload || !payload.sub || !payload.orgId || !payload.orgName) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body: CreateLCCRequest = await req.json();

    // Validate required fields
    if (!body.name || !body.code || !body.address || !body.city || !body.state || !body.country || !body.establishedDate || !body.leaderId || !body.contactEmail || !body.contactPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate code
    const lccData = await kv.get('lcc:index');
    const existingLCC: LCCRecord[] = lccData ? JSON.parse(lccData) : [];
    const duplicate = existingLCC.find(lcc => 
      lcc.code.toLowerCase() === body.code.toLowerCase() && lcc.orgId === (payload.orgId as string)
    );

    if (duplicate) {
      return NextResponse.json({ error: 'LCC code already exists' }, { status: 409 });
    }

    // Get leader information
    const leadersData = await kv.get('leaders:index');
    const allLeaders = leadersData ? JSON.parse(leadersData) : [];
    const leader = allLeaders.find((l: any) => l.id === body.leaderId && l.orgId === (payload.orgId as string));

    if (!leader) {
      return NextResponse.json({ error: 'Leader not found' }, { status: 404 });
    }

    // Create LCC record
    const lccRecord: LCCRecord = {
      id: generateLCCId(),
      name: body.name,
      code: body.code,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      establishedDate: body.establishedDate,
      status: 'active',
      capacity: body.capacity,
      memberCount: 0, // Initialize with 0, can be updated later
      leaderId: body.leaderId,
      leaderName: `${leader.firstName} ${leader.surname}`,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save individual LCC record
    await kv.set(`lcc:${lccRecord.id}`, JSON.stringify(lccRecord));

    // Update LCC index
    const updatedLCC = [...existingLCC, lccRecord];
    await kv.set('lcc:index', JSON.stringify(updatedLCC));

    return NextResponse.json({ 
      message: 'LCC created successfully', 
      lcc: lccRecord 
    }, { status: 201 });
  } catch (error) {
    console.error('LCC POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}