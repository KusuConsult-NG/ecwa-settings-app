import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { status, currentMembers } = await req.json();
    const lcId = params.id;

    if (!status || !['active', 'inactive', 'suspended', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, inactive, suspended, or closed' },
        { status: 400 }
      );
    }

    const lcData = await kv.get(`lc:${lcId}`);
    if (!lcData) {
      return NextResponse.json({ error: 'LC not found' }, { status: 404 });
    }

    const lc = JSON.parse(lcData);

    if (lc.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    lc.status = status;
    lc.updatedAt = new Date().toISOString();

    if (currentMembers !== undefined) {
      lc.currentMembers = Number(currentMembers);
    }

    await kv.set(`lc:${lcId}`, JSON.stringify(lc));

    const lcIndexData = await kv.get('lc:index');
    const lcIndex = lcIndexData ? JSON.parse(lcIndexData) : [];
    const updatedIndex = lcIndex.map((l: any) => 
      l.id === lcId ? lc : l
    );
    await kv.set('lc:index', JSON.stringify(updatedIndex));

    return NextResponse.json({
      success: true,
      lc,
      message: `LC status updated to ${status}`
    });

  } catch (error) {
    console.error('Update LC status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
