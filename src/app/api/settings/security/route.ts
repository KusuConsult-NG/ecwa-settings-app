import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { kv } from '@/lib/kv';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const settings = await req.json();

    // Get user from token
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Validate settings
    const {
      twoFactorAuth,
      sessionTimeout,
      ipRestrictions,
      sessionTimeoutMinutes,
      loginNotifications,
      passwordExpiry,
      passwordExpiryDays
    } = settings;

    // Store security settings for user in KV store
    const securitySettings = {
      twoFactorAuth: Boolean(twoFactorAuth),
      sessionTimeout: Boolean(sessionTimeout),
      ipRestrictions: Boolean(ipRestrictions),
      sessionTimeoutMinutes: parseInt(sessionTimeoutMinutes) || 30,
      loginNotifications: Boolean(loginNotifications),
      passwordExpiry: Boolean(passwordExpiry),
      passwordExpiryDays: parseInt(passwordExpiryDays) || 90,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`security_settings:${payload.email}`, JSON.stringify(securitySettings));

    return NextResponse.json({
      success: true,
      message: 'Security settings updated successfully',
      settings: securitySettings
    });

  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get user from token
    const token = req.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get security settings for user from KV store
    const settingsData = await kv.get(`security_settings:${payload.email}`);
    const settings = settingsData ? JSON.parse(settingsData) : {
      twoFactorAuth: false,
      sessionTimeout: true,
      ipRestrictions: false,
      sessionTimeoutMinutes: 30,
      loginNotifications: true,
      passwordExpiry: false,
      passwordExpiryDays: 90
    };

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    );
  }
}
