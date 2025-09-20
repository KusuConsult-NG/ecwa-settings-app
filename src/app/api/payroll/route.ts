import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import { PayrollRecord, CreatePayrollRequest, generatePayrollId } from '@/lib/payroll';
import crypto from 'crypto';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/payroll - Get all payroll records
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
    const month = searchParams.get('month');
    const search = searchParams.get('search');

    // Get all payroll records from KV store
    const payrollData = await kv.get('payroll:index');
    const allPayroll: PayrollRecord[] = payrollData ? JSON.parse(payrollData) : [];

    // Filter payroll records by organization
    let filteredPayroll = allPayroll.filter(record => record.orgId === (payload.orgId as string));

    // Apply additional filters
    if (status) {
      filteredPayroll = filteredPayroll.filter(record => record.status === status);
    }
    if (month) {
      filteredPayroll = filteredPayroll.filter(record => record.payPeriod.includes(month));
    }
    if (search) {
      filteredPayroll = filteredPayroll.filter(record => 
        record.staffName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ payroll: filteredPayroll });
  } catch (error) {
    console.error('Payroll GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/payroll - Create new payroll record
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

    const body: CreatePayrollRequest = await req.json();

    // Validate required fields
    if (!body.staffId || !body.payPeriod || !body.payDate || body.basicSalary === undefined || body.allowances === undefined || body.deductions === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get staff information
    const staffData = await kv.get('staff:index');
    const allStaff = staffData ? JSON.parse(staffData) : [];
    const staff = allStaff.find((s: any) => s.id === body.staffId && s.orgId === (payload.orgId as string));

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Check for duplicate payroll record
    const payrollData = await kv.get('payroll:index');
    const existingPayroll: PayrollRecord[] = payrollData ? JSON.parse(payrollData) : [];
    const duplicate = existingPayroll.find(record => 
      record.staffId === body.staffId && 
      record.payPeriod === body.payPeriod &&
      record.orgId === (payload.orgId as string)
    );

    if (duplicate) {
      return NextResponse.json({ error: 'Payroll record already exists for this staff member and period' }, { status: 409 });
    }

    // Calculate salaries
    const grossSalary = body.basicSalary + body.allowances;
    const netSalary = grossSalary - body.deductions;

    // Create payroll record
    const payrollRecord: PayrollRecord = {
      id: generatePayrollId(),
      staffId: body.staffId,
      staffName: staff.name,
      staffEmail: staff.email,
      staffPosition: staff.position || '',
      staffDepartment: staff.department || '',
      basicSalary: body.basicSalary,
      allowances: body.allowances,
      deductions: body.deductions,
      grossSalary: grossSalary,
      netSalary: netSalary,
      payPeriod: body.payPeriod,
      payDate: body.payDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save individual payroll record
    await kv.set(`payroll:${payrollRecord.id}`, JSON.stringify(payrollRecord));

    // Update payroll index
    const updatedPayroll = [...existingPayroll, payrollRecord];
    await kv.set('payroll:index', JSON.stringify(updatedPayroll));

    return NextResponse.json({ 
      message: 'Payroll record created successfully', 
      payroll: payrollRecord 
    }, { status: 201 });
  } catch (error) {
    console.error('Payroll POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}