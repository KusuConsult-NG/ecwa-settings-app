import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { LCRecord, CreateLCRequest, generateLCId } from '@/lib/lc';
import crypto from 'crypto';

// GET /api/lc - Get all LC records
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Get all LC records from KV store
    const lcData = await kv.get('lc:index');
    const allLC: LCRecord[] = lcData ? JSON.parse(lcData) : [];

    // Filter LC records by organization
    let filteredLC = allLC.filter(lc => lc.orgId === payload.orgId);

    // Apply additional filters
    if (status) {
      filteredLC = filteredLC.filter(lc => lc.status === status);
    }
    if (search) {
      filteredLC = filteredLC.filter(lc => 
        lc.name.toLowerCase().includes(search.toLowerCase()) ||
        lc.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ lcs: filteredLC });
  } catch (error) {
    console.error('LC GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/lc - Create new LC record
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

    const body: CreateLCRequest = await req.json();

    // Validate required fields
    if (!body.name || !body.code || !body.address || !body.city || !body.state || !body.country || !body.establishedDate || !body.leaderId || !body.contactEmail || !body.contactPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate code
    const lcData = await kv.get('lc:index');
    const existingLC: LCRecord[] = lcData ? JSON.parse(lcData) : [];
    const duplicate = existingLC.find(lc => 
      lc.code.toLowerCase() === body.code.toLowerCase() && lc.orgId === payload.orgId
    );

    if (duplicate) {
      return NextResponse.json({ error: 'LC code already exists' }, { status: 409 });
    }

    // Get leader information
    const leadersData = await kv.get('leaders:index');
    const allLeaders = leadersData ? JSON.parse(leadersData) : [];
    const leader = allLeaders.find((l: any) => l.id === body.leaderId && l.orgId === payload.orgId);

    if (!leader) {
      return NextResponse.json({ error: 'Leader not found' }, { status: 404 });
    }

    // Create LC record
    const lcRecord: LCRecord = {
      id: generateLCId(),
      name: body.name,
      code: body.code,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      establishedDate: body.establishedDate,
      status: 'active',
      memberCount: body.memberCount,
      maxCapacity: body.memberCount, // Use memberCount as maxCapacity for now
      leaderId: body.leaderId,
      leaderName: `${leader.firstName} ${leader.surname}`,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub,
      orgId: payload.orgId,
      orgName: payload.orgName
    };

    // Save individual LC record
    await kv.set(`lc:${lcRecord.id}`, JSON.stringify(lcRecord));

    // Update LC index
    const updatedLC = [...existingLC, lcRecord];
    await kv.set('lc:index', JSON.stringify(updatedLC));

    return NextResponse.json({ 
      message: 'LC created successfully', 
      lc: lcRecord 
    }, { status: 201 });
  } catch (error) {
    console.error('LC POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}