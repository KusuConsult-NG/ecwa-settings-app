import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// GET /api/leave/balance - Get leave balance for staff
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

    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('staffId');
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // Get leave records from database
    const leaveData = await kv.get('leave:index');
    const leaveRecords = leaveData ? JSON.parse(leaveData) : [];

    // Filter by organization and year
    const orgLeaveRecords = leaveRecords.filter((l: any) => 
      l.orgId === payload.orgId && 
      new Date(l.startDate).getFullYear() === parseInt(year)
    );

    // If specific staff ID provided, filter by staff
    const filteredRecords = staffId 
      ? orgLeaveRecords.filter((l: any) => l.staffId === staffId)
      : orgLeaveRecords;

    // Calculate leave balance for each staff member
    const staffBalances: { [staffId: string]: any } = {};

    // Default leave entitlements (can be made configurable)
    const defaultEntitlements = {
      annual: 21, // 21 days annual leave
      sick: 10,   // 10 days sick leave
      maternity: 90, // 90 days maternity leave
      paternity: 14, // 14 days paternity leave
      emergency: 5,  // 5 days emergency leave
      study: 7,      // 7 days study leave
      unpaid: 0      // No limit for unpaid leave
    };

    // Group leave records by staff member
    filteredRecords.forEach((record: any) => {
      if (!staffBalances[record.staffId]) {
        staffBalances[record.staffId] = {
          staffId: record.staffId,
          staffName: record.staffName,
          staffEmail: record.staffEmail,
          entitlements: { ...defaultEntitlements },
          used: {
            annual: 0,
            sick: 0,
            maternity: 0,
            paternity: 0,
            emergency: 0,
            study: 0,
            unpaid: 0
          },
          balance: { ...defaultEntitlements }
        };
      }

      // Only count approved leave
      if (record.status === 'approved') {
        staffBalances[record.staffId].used[record.leaveType] += record.daysRequested;
      }
    });

    // Calculate remaining balance
    Object.keys(staffBalances).forEach(staffId => {
      const balance = staffBalances[staffId];
      Object.keys(balance.balance).forEach(leaveType => {
        balance.balance[leaveType] = Math.max(0, 
          balance.entitlements[leaveType] - balance.used[leaveType]
        );
      });
    });

    return NextResponse.json({
      staffBalances: Object.values(staffBalances),
      year: parseInt(year)
    });

  } catch (error) {
    console.error('Get leave balance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
