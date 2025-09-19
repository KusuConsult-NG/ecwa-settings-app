import { NextResponse } from 'next/server';
import { signJwt, verifyJwt } from '@/lib/auth';

export async function GET() {
  try {
    // Test JWT signing and verification
    const testPayload = { 
      sub: 'test-user-id', 
      email: 'test@example.com',
      name: 'Test User',
      role: 'test',
      orgId: 'test-org-id',
      orgName: 'Test Organization'
    };

    // Sign a JWT
    const token = await signJwt(testPayload);
    console.log('JWT signed successfully');

    // Verify the JWT
    const verified = await verifyJwt(token);
    console.log('JWT verified successfully:', verified);

    if (verified && verified.sub === testPayload.sub) {
      return NextResponse.json({ 
        success: true,
        message: 'JWT system is working correctly',
        testPayload,
        verified
      });
    } else {
      return NextResponse.json({ 
        success: false,
        message: 'JWT verification failed',
        testPayload,
        verified
      }, { status: 500 });
    }

  } catch (error) {
    console.error('JWT test error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'JWT system failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
