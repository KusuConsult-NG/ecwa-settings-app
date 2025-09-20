import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('auth=')[1]?.split(';')[0];
    
    if (!token) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'No token found' 
      });
    }

    const payload = await verifyJwt(token);
    
    if (!payload) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'Invalid token' 
      });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: payload 
    });

  } catch (error) {
    return NextResponse.json({ 
      authenticated: false, 
      message: 'Token verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
