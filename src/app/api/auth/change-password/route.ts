import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyJwt } from '@/lib/auth';
import { kv, type UserRecord } from '@/lib/kv';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    // Get user from token
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find user in KV store
    const userData = await kv.get(`user:${payload.email}`);
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user: UserRecord = JSON.parse(userData);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update user password in KV store
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();
    await kv.set(`user:${payload.email}`, JSON.stringify(user));

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
