import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { LeaveRecord, CreateLeaveRequest, generateLeaveId } from '@/lib/leave';
import crypto from 'crypto';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/leave - Get all leave requests
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
    const leaveType = searchParams.get('leaveType');
    const search = searchParams.get('search');

    // Get all leave records from KV store
    const leaveData = await kv.get('leave:index');
    const allLeave: LeaveRecord[] = leaveData ? JSON.parse(leaveData) : [];

    // Filter leave records by organization
    let filteredLeave = allLeave.filter(record => record.orgId === (payload.orgId as string));

    // Apply additional filters
    if (status) {
      filteredLeave = filteredLeave.filter(record => record.status === status);
    }
    if (leaveType) {
      filteredLeave = filteredLeave.filter(record => record.leaveType === leaveType);
    }
    if (search) {
      filteredLeave = filteredLeave.filter(record => 
        record.staffName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ leave: filteredLeave });
  } catch (error) {
    console.error('Leave GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leave - Create new leave request
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

    const body: CreateLeaveRequest = await req.json();

    // Validate required fields
    if (!body.staffId || !body.leaveType || !body.startDate || !body.endDate || !body.reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get staff information
    const staffData = await kv.get('staff:index');
    const allStaff = staffData ? JSON.parse(staffData) : [];
    const staff = allStaff.find((s: any) => s.id === body.staffId && s.orgId === (payload.orgId as string));

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Calculate duration
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;

    if (durationDays <= 0) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Check for overlapping leave requests
    const leaveData = await kv.get('leave:index');
    const existingLeave: LeaveRecord[] = leaveData ? JSON.parse(leaveData) : [];
    const overlapping = existingLeave.find(record => 
      record.staffId === body.staffId && 
      record.status !== 'rejected' &&
      record.orgId === (payload.orgId as string) &&
      (
        (new Date(record.startDate) <= startDate && new Date(record.endDate) >= startDate) ||
        (new Date(record.startDate) <= endDate && new Date(record.endDate) >= endDate) ||
        (startDate <= new Date(record.startDate) && endDate >= new Date(record.endDate))
      )
    );

    if (overlapping) {
      return NextResponse.json({ error: 'Leave request overlaps with existing request' }, { status: 409 });
    }

    // Create leave record
    const leaveRecord: LeaveRecord = {
      id: generateLeaveId(),
      staffId: body.staffId,
      staffName: staff.name,
      staffEmail: staff.email,
      leaveType: body.leaveType,
      startDate: body.startDate,
      endDate: body.endDate,
      daysRequested: durationDays,
      reason: body.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save individual leave record
    await kv.set(`leave:${leaveRecord.id}`, JSON.stringify(leaveRecord));

    // Update leave index
    const updatedLeave = [...existingLeave, leaveRecord];
    await kv.set('leave:index', JSON.stringify(updatedLeave));

    return NextResponse.json({ 
      message: 'Leave request created successfully', 
      leave: leaveRecord 
    }, { status: 201 });
  } catch (error) {
    console.error('Leave POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}