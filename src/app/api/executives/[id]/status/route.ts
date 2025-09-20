import { NextRequest, NextResponse } from 'next/server';
import { ExecutiveRecord } from '@/lib/executive';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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

    const { id } = params;
    const body = await req.json();
    const { status, reason } = body;

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, inactive, or suspended' },
        { status: 400 }
      );
    }

    // Get executive from KV store
    const executiveData = await kv.get(`executive:${id}`);
    if (!executiveData) {
      return NextResponse.json(
        { error: 'Executive not found' },
        { status: 404 }
      );
    }

    const executive: ExecutiveRecord = JSON.parse(executiveData);

    // Check if user has permission to update this executive
    if (executive.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the executive
    executive.status = status as 'active' | 'inactive' | 'suspended';
    executive.updatedAt = new Date().toISOString();

    // Save updated executive
    await kv.set(`executive:${id}`, JSON.stringify(executive));

    // Update executives index
    const executivesIndexData = await kv.get('executives:index');
    const executivesIndex = executivesIndexData ? JSON.parse(executivesIndexData) : [];
    const updatedIndex = executivesIndex.map((e: any) => 
      e.id === id ? executive : e
    );
    await kv.set('executives:index', JSON.stringify(updatedIndex));

    return NextResponse.json({
      success: true,
      executive,
      message: `Executive status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating executive status:', error);
    return NextResponse.json(
      { error: 'Failed to update executive status' },
      { status: 500 }
    );
  }
}
