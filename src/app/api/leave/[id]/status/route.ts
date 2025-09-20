import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// PATCH /api/leave/[id]/status - Update leave status
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

    const { status, rejectionReason } = await req.json();
    const leaveId = params.id;

    if (!status || !['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, rejected, or cancelled' },
        { status: 400 }
      );
    }

    // Get leave record
    const leaveData = await kv.get(`leave:${leaveId}`);
    if (!leaveData) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const leaveRecord = JSON.parse(leaveData);

    // Check if user has permission to update this leave record
    if (leaveRecord.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update status and related fields
    leaveRecord.status = status;
    leaveRecord.updatedAt = new Date().toISOString();

    if (status === 'approved') {
      leaveRecord.approvedBy = payload.sub as string;
      leaveRecord.approvedByName = payload.name as string;
      leaveRecord.approvedAt = new Date().toISOString();
    } else if (status === 'rejected') {
      leaveRecord.rejectedBy = payload.sub as string;
      leaveRecord.rejectedByName = payload.name as string;
      leaveRecord.rejectedAt = new Date().toISOString();
      if (rejectionReason) {
        leaveRecord.rejectionReason = rejectionReason.trim();
      }
    }

    // Save updated leave record
    await kv.set(`leave:${leaveId}`, JSON.stringify(leaveRecord));

    // Update leave index
    const leaveIndexData = await kv.get('leave:index');
    const leaveIndex = leaveIndexData ? JSON.parse(leaveIndexData) : [];
    const updatedIndex = leaveIndex.map((l: any) => 
      l.id === leaveId ? leaveRecord : l
    );
    await kv.set('leave:index', JSON.stringify(updatedIndex));

    return NextResponse.json({
      success: true,
      leaveRecord,
      message: `Leave request ${status} successfully`
    });

  } catch (error) {
    console.error('Update leave status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
