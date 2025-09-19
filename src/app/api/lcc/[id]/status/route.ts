import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// PATCH /api/lcc/[id]/status - Update LCC status
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

    const { status, currentMembers } = await req.json();
    const lccId = params.id;

    if (!status || !['active', 'inactive', 'suspended', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, inactive, suspended, or closed' },
        { status: 400 }
      );
    }

    // Get LCC record
    const lccData = await kv.get(`lcc:${lccId}`);
    if (!lccData) {
      return NextResponse.json({ error: 'LCC not found' }, { status: 404 });
    }

    const lcc = JSON.parse(lccData);

    // Check if user has permission to update this LCC
    if (lcc.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update status and related fields
    lcc.status = status;
    lcc.updatedAt = new Date().toISOString();

    if (currentMembers !== undefined) {
      lcc.currentMembers = Number(currentMembers);
    }

    // Save updated LCC record
    await kv.set(`lcc:${lccId}`, JSON.stringify(lcc));

    // Update LCC index
    const lccIndexData = await kv.get('lcc:index');
    const lccIndex = lccIndexData ? JSON.parse(lccIndexData) : [];
    const updatedIndex = lccIndex.map((l: any) => 
      l.id === lccId ? lcc : l
    );
    await kv.set('lcc:index', JSON.stringify(updatedIndex));

    return NextResponse.json({
      success: true,
      lcc,
      message: `LCC status updated to ${status}`
    });

  } catch (error) {
    console.error('Update LCC status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
