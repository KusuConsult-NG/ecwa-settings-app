import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

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

    const { status, currentBalance } = await req.json();
    const accountId = params.id;

    if (!status || !['active', 'inactive', 'suspended', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, inactive, suspended, or closed' },
        { status: 400 }
      );
    }

    const accountData = await kv.get(`bank:${accountId}`);
    if (!accountData) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    const account = JSON.parse(accountData);

    if (account.orgId !== payload.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    account.status = status;
    account.updatedAt = new Date().toISOString();

    if (currentBalance !== undefined) {
      account.currentBalance = Number(currentBalance);
    }

    await kv.set(`bank:${accountId}`, JSON.stringify(account));

    const bankIndexData = await kv.get('bank:index');
    const bankIndex = bankIndexData ? JSON.parse(bankIndexData) : [];
    const updatedIndex = bankIndex.map((a: any) => 
      a.id === accountId ? account : a
    );
    await kv.set('bank:index', JSON.stringify(updatedIndex));

    return NextResponse.json({
      success: true,
      account,
      message: `Bank account status updated to ${status}`
    });

  } catch (error) {
    console.error('Update bank account status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
