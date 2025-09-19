import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// PATCH /api/payroll/[id]/status - Update payroll status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status, paymentDate, notes } = await req.json();
    const payrollId = params.id;

    if (!status || !['pending', 'approved', 'paid', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, paid, or rejected' },
        { status: 400 }
      );
    }

    // Get payroll record
    const payrollData = await kv.get(`payroll:${payrollId}`);
    if (!payrollData) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    const payroll = JSON.parse(payrollData);

    // Check if user has permission to update this payroll record
    if (payroll.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update status and related fields
    payroll.status = status;
    payroll.updatedAt = new Date().toISOString();

    if (paymentDate) {
      payroll.paymentDate = paymentDate;
    }

    if (notes) {
      payroll.notes = notes;
    }

    // If status is paid, set payment date if not provided
    if (status === 'paid' && !payroll.paymentDate) {
      payroll.paymentDate = new Date().toISOString();
    }

    // Save updated payroll record
    await kv.set(`payroll:${payrollId}`, JSON.stringify(payroll));

    // Update payroll index
    const payrollIndexData = await kv.get('payroll:index');
    const payrollIndex = payrollIndexData ? JSON.parse(payrollIndexData) : [];
    const updatedIndex = payrollIndex.map((p: any) => 
      p.id === payrollId ? payroll : p
    );
    await kv.set('payroll:index', JSON.stringify(updatedIndex));

    return NextResponse.json({
      success: true,
      payroll,
      message: `Payroll status updated to ${status}`
    });

  } catch (error) {
    console.error('Update payroll status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
