import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';
import crypto from 'crypto';

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  month: string; // YYYY-MM format
  year: number;
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    other: number;
  };
  deductions: {
    tax: number;
    pension: number;
    loan: number;
    other: number;
  };
  overtime: number;
  bonus: number;
  netSalary: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paymentMethod: 'bank_transfer' | 'cash' | 'cheque';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

// GET /api/payroll - Get all payroll records
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
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const staffId = searchParams.get('staffId');

    // Get payroll from database
    const payrollData = await kv.get('payroll:index');
    let payroll: PayrollRecord[] = payrollData ? JSON.parse(payrollData) : [];

    // Filter by organization
    payroll = payroll.filter(p => p.orgId === payload.orgId);

    // Apply filters
    if (status) {
      payroll = payroll.filter(p => p.status === status);
    }

    if (month) {
      payroll = payroll.filter(p => p.month === month);
    }

    if (year) {
      payroll = payroll.filter(p => p.year === parseInt(year));
    }

    if (staffId) {
      payroll = payroll.filter(p => p.staffId === staffId);
    }

    // Sort by month/year descending
    payroll.sort((a, b) => {
      const dateA = new Date(`${a.year}-${a.month}-01`);
      const dateB = new Date(`${b.year}-${b.month}-01`);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({
      payroll,
      total: payroll.length,
      totalAmount: payroll.reduce((sum, p) => sum + p.netSalary, 0)
    });

  } catch (error) {
    console.error('Get payroll error:', error);
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
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const {
      staffId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      overtime,
      bonus,
      paymentMethod,
      notes
    } = body;

    // Validation
    if (!staffId || !month || !year || !basicSalary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get staff member details
    const staffData = await kv.get(`staff:${staffId}`);
    if (!staffData) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const staff = JSON.parse(staffData);

    // Check if payroll already exists for this staff and month
    const payrollData = await kv.get('payroll:index');
    const existingPayroll: PayrollRecord[] = payrollData ? JSON.parse(payrollData) : [];
    
    const duplicateExists = existingPayroll.some(p => 
      p.staffId === staffId && p.month === month && p.year === parseInt(year) && p.orgId === payload.orgId
    );

    if (duplicateExists) {
      return NextResponse.json(
        { error: 'Payroll record already exists for this staff member and month' },
        { status: 409 }
      );
    }

    // Calculate net salary
    const totalAllowances = (allowances?.housing || 0) + (allowances?.transport || 0) + 
                           (allowances?.medical || 0) + (allowances?.other || 0);
    const totalDeductions = (deductions?.tax || 0) + (deductions?.pension || 0) + 
                           (deductions?.loan || 0) + (deductions?.other || 0);
    const netSalary = basicSalary + totalAllowances + (overtime || 0) + (bonus || 0) - totalDeductions;

    // Create payroll record
    const payroll: PayrollRecord = {
      id: crypto.randomUUID(),
      staffId,
      staffName: staff.name,
      staffEmail: staff.email,
      month,
      year: parseInt(year),
      basicSalary: Number(basicSalary),
      allowances: {
        housing: Number(allowances?.housing || 0),
        transport: Number(allowances?.transport || 0),
        medical: Number(allowances?.medical || 0),
        other: Number(allowances?.other || 0)
      },
      deductions: {
        tax: Number(deductions?.tax || 0),
        pension: Number(deductions?.pension || 0),
        loan: Number(deductions?.loan || 0),
        other: Number(deductions?.other || 0)
      },
      overtime: Number(overtime || 0),
      bonus: Number(bonus || 0),
      netSalary,
      status: 'pending',
      paymentMethod: paymentMethod || 'bank_transfer',
      notes: notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: payload.sub as string,
      orgId: payload.orgId as string,
      orgName: payload.orgName as string
    };

    // Save to database
    await kv.set(`payroll:${payroll.id}`, JSON.stringify(payroll));
    
    // Update payroll index
    existingPayroll.push(payroll);
    await kv.set('payroll:index', JSON.stringify(existingPayroll));

    return NextResponse.json({
      success: true,
      payroll,
      message: 'Payroll record created successfully'
    });

  } catch (error) {
    console.error('Create payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
