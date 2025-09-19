import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import crypto from 'crypto';

// Interface moved to @/lib/staff
interface StaffRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'suspended';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

// GET /api/staff - Get all staff
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
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    // Get staff from database
    const staffData = await kv.get('staff:index');
    let staff: StaffRecord[] = staffData ? JSON.parse(staffData) : [];

    // Filter by organization
    staff = staff.filter(s => s.orgId === payload.orgId);

    // Apply filters
    if (status) {
      staff = staff.filter(s => s.status === status);
    }

    if (department) {
      staff = staff.filter(s => s.department === department);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      staff = staff.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        s.position.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      staff,
      total: staff.length
    });

  } catch (error) {
    console.error('Get staff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/staff - Create new staff member
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
      email,
      phone,
      address,
      position,
      department,
      salary,
      startDate,
      emergencyContact
    } = body;

    // Validation
    if (!name || !email || !phone || !address || !position || !department || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const staffData = await kv.get('staff:index');
    const existingStaff: StaffRecord[] = staffData ? JSON.parse(staffData) : [];
    
    const emailExists = existingStaff.some(s => 
      s.email.toLowerCase() === email.toLowerCase() && s.orgId === payload.orgId
    );

    if (emailExists) {
      return NextResponse.json(
        { error: 'Staff member with this email already exists' },
        { status: 409 }
      );
    }

    // Create staff record
    const staff: StaffRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      position: position.trim(),
      department: department.trim(),
      salary: Number(salary) || 0,
      startDate,
      status: 'active',
      emergencyContact: {
        name: emergencyContact?.name?.trim() || '',
        phone: emergencyContact?.phone?.trim() || '',
        relationship: emergencyContact?.relationship?.trim() || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save to database
    await kv.set(`staff:${staff.id}`, JSON.stringify(staff));
    
    // Update staff index
    existingStaff.push(staff);
    await kv.set('staff:index', JSON.stringify(existingStaff));

    return NextResponse.json({
      success: true,
      staff,
      message: 'Staff member added successfully'
    });

  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
