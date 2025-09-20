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

    const { status, memberCount } = await req.json();
    const agencyId = params.id;

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, inactive, or suspended' },
        { status: 400 }
      );
    }

    const agencyData = await kv.get(`agencies:${agencyId}`);
    if (!agencyData) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    const agency = JSON.parse(agencyData);

    if (agency.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    agency.status = status;
    agency.updatedAt = new Date().toISOString();

    if (memberCount !== undefined) {
      agency.memberCount = Number(memberCount);
    }

    await kv.set(`agencies:${agencyId}`, JSON.stringify(agency));

    const agenciesIndexData = await kv.get('agencies:index');
    const agenciesIndex = agenciesIndexData ? JSON.parse(agenciesIndexData) : [];
    const updatedIndex = agenciesIndex.map((a: any) => 
      a.id === agencyId ? agency : a
    );
    await kv.set('agencies:index', JSON.stringify(updatedIndex));

    return NextResponse.json({
      success: true,
      agency,
      message: `Agency status updated to ${status}`
    });

  } catch (error) {
    console.error('Update agency status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
