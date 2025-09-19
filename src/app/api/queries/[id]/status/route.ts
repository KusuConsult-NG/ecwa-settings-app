import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// PATCH /api/queries/[id]/status - Update query status
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

    const { status, resolution, assignedTo } = await req.json();
    const queryId = params.id;

    if (!status || !['open', 'in_progress', 'resolved', 'closed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be open, in_progress, resolved, closed, or cancelled' },
        { status: 400 }
      );
    }

    // Get query record
    const queryData = await kv.get(`queries:${queryId}`);
    if (!queryData) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 });
    }

    const query = JSON.parse(queryData);

    // Check if user has permission to update this query
    if (query.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update status and related fields
    query.status = status;
    query.updatedAt = new Date().toISOString();

    if (status === 'in_progress' && assignedTo) {
      // Get assigned staff member details
      const staffData = await kv.get(`staff:${assignedTo}`);
      if (staffData) {
        const staff = JSON.parse(staffData);
        query.assignedTo = assignedTo;
        query.assignedToName = staff.name;
        query.assignedToEmail = staff.email;
        query.assignedAt = new Date().toISOString();
      }
    }

    if (status === 'resolved') {
      query.resolvedAt = new Date().toISOString();
      if (resolution) {
        query.resolution = resolution.trim();
      }
    }

    if (status === 'closed') {
      query.closedAt = new Date().toISOString();
    }

    // Save updated query record
    await kv.set(`queries:${queryId}`, JSON.stringify(query));

    // Update queries index
    const queriesIndexData = await kv.get('queries:index');
    const queriesIndex = queriesIndexData ? JSON.parse(queriesIndexData) : [];
    const updatedIndex = queriesIndex.map((q: any) => 
      q.id === queryId ? query : q
    );
    await kv.set('queries:index', JSON.stringify(updatedIndex));

    return NextResponse.json({
      success: true,
      query,
      message: `Query ${status} successfully`
    });

  } catch (error) {
    console.error('Update query status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
