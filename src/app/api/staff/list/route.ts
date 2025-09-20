import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/staff/list - Get staff list for dropdowns
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

    // Get staff from database
    const staffData = await kv.get('staff:index');
    let staff = staffData ? JSON.parse(staffData) : [];

    // Filter by organization and only active staff
    staff = staff
      .filter((s: any) => s.orgId === payload.orgId && s.status === 'active')
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        position: s.position,
        department: s.department,
        salary: s.salary
      }));

    return NextResponse.json({ staff });

  } catch (error) {
    console.error('Get staff list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
