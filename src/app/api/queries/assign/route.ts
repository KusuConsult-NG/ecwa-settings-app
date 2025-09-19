import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// POST /api/queries/assign - Assign query to staff member
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

    const { queryId, assignedTo } = await req.json();

    if (!queryId || !assignedTo) {
      return NextResponse.json(
        { error: 'Missing queryId or assignedTo' },
        { status: 400 }
      );
    }

    // Get query record
    const queryData = await kv.get(`queries:${queryId}`);
    if (!queryData) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 });
    }

    const query = JSON.parse(queryData);

    // Check if user has permission to assign this query
    if (query.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get assigned staff member details
    const staffData = await kv.get(`staff:${assignedTo}`);
    if (!staffData) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const staff = JSON.parse(staffData);

    // Update query with assignment
    query.assignedTo = assignedTo;
    query.assignedToName = staff.name;
    query.assignedToEmail = staff.email;
    query.assignedAt = new Date().toISOString();
    query.status = 'in_progress';
    query.updatedAt = new Date().toISOString();

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
      message: `Query assigned to ${staff.name} successfully`
    });

  } catch (error) {
    console.error('Assign query error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
