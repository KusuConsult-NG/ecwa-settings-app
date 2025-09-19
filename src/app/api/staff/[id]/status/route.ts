import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// PATCH /api/staff/[id]/status - Update staff status
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

    const { status } = await req.json();
    const staffId = params.id;

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, inactive, or suspended' },
        { status: 400 }
      );
    }

    // Get staff member
    const staffData = await kv.get(`staff:${staffId}`);
    if (!staffData) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const staff = JSON.parse(staffData);

    // Check if user has permission to update this staff member
    if (staff.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update status
    staff.status = status;
    staff.updatedAt = new Date().toISOString();

    // Save updated staff member
    await kv.set(`staff:${staffId}`, JSON.stringify(staff));

    // Update staff index
    const staffIndexData = await kv.get('staff:index');
    const staffIndex = staffIndexData ? JSON.parse(staffIndexData) : [];
    const updatedIndex = staffIndex.map((s: any) => 
      s.id === staffId ? staff : s
    );
    await kv.set('staff:index', JSON.stringify(updatedIndex));

    return NextResponse.json({
      success: true,
      staff,
      message: `Staff member status updated to ${status}`
    });

  } catch (error) {
    console.error('Update staff status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
