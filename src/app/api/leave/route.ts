import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import crypto from 'crypto';

export interface LeaveRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid' | 'study';
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedByName?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

// GET /api/leave - Get all leave records
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
    const staffId = searchParams.get('staffId');
    const leaveType = searchParams.get('leaveType');
    const year = searchParams.get('year');

    // Get leave records from database
    const leaveData = await kv.get('leave:index');
    let leaveRecords: LeaveRecord[] = leaveData ? JSON.parse(leaveData) : [];

    // Filter by organization
    leaveRecords = leaveRecords.filter(l => l.orgId === payload.orgId);

    // Apply filters
    if (status) {
      leaveRecords = leaveRecords.filter(l => l.status === status);
    }

    if (staffId) {
      leaveRecords = leaveRecords.filter(l => l.staffId === staffId);
    }

    if (leaveType) {
      leaveRecords = leaveRecords.filter(l => l.leaveType === leaveType);
    }

    if (year) {
      const yearNum = parseInt(year);
      leaveRecords = leaveRecords.filter(l => {
        const startYear = new Date(l.startDate).getFullYear();
        return startYear === yearNum;
      });
    }

    // Sort by start date descending
    leaveRecords.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    // Calculate summary statistics
    const summary = {
      total: leaveRecords.length,
      pending: leaveRecords.filter(l => l.status === 'pending').length,
      approved: leaveRecords.filter(l => l.status === 'approved').length,
      rejected: leaveRecords.filter(l => l.status === 'rejected').length,
      totalDays: leaveRecords.reduce((sum, l) => sum + l.daysRequested, 0)
    };

    return NextResponse.json({
      leaveRecords,
      summary
    });

  } catch (error) {
    console.error('Get leave records error:', error);
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
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const {
      staffId,
      leaveType,
      startDate,
      endDate,
      reason
    } = body;

    // Validation
    if (!staffId || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Calculate days requested
    const timeDiff = end.getTime() - start.getTime();
    const daysRequested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days

    // Get staff member details
    const staffData = await kv.get(`staff:${staffId}`);
    if (!staffData) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const staff = JSON.parse(staffData);

    // Check for overlapping leave requests
    const leaveData = await kv.get('leave:index');
    const existingLeave: LeaveRecord[] = leaveData ? JSON.parse(leaveData) : [];
    
    const overlappingLeave = existingLeave.some(l => 
      l.staffId === staffId && 
      l.status !== 'rejected' && 
      l.status !== 'cancelled' &&
      ((new Date(l.startDate) <= end && new Date(l.endDate) >= start))
    );

    if (overlappingLeave) {
      return NextResponse.json(
        { error: 'Leave request overlaps with existing approved or pending leave' },
        { status: 409 }
      );
    }

    // Create leave record
    const leaveRecord: LeaveRecord = {
      id: crypto.randomUUID(),
      staffId,
      staffName: staff.name,
      staffEmail: staff.email,
      leaveType,
      startDate,
      endDate,
      daysRequested,
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save to database
    await kv.set(`leave:${leaveRecord.id}`, JSON.stringify(leaveRecord));
    
    // Update leave index
    existingLeave.push(leaveRecord);
    await kv.set('leave:index', JSON.stringify(existingLeave));

    return NextResponse.json({
      success: true,
      leaveRecord,
      message: 'Leave request submitted successfully'
    });

  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
