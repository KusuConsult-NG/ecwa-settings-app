import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyJwt } from '@/lib/auth';

// Mock user storage - replace with real database
const users = new Map([
  ['admin@example.com', {
    id: 'u1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "admin123"
    createdAt: new Date().toISOString(),
    orgId: 'org1',
    orgName: 'ECWA Organization',
    isActive: true,
    lastLogin: null
  }]
]);

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

    // Find user
    const user = users.get(payload.email as string);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.passwordHash = newPasswordHash;
    users.set(payload.email as string, user);

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
