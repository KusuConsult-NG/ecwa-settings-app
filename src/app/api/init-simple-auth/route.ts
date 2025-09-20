import { NextResponse } from 'next/server';
import { initializeDefaultUsers } from '@/lib/simple-auth';

export async function POST() {
  try {
    console.log('🔧 SIMPLE AUTH INIT: Initializing simple authentication system...');
    
    // Initialize default users
    initializeDefaultUsers();
    
    return NextResponse.json({
      success: true,
      message: 'Simple authentication system initialized successfully',
      features: [
        'File-based user storage',
        'Session-based authentication',
        'Simple and reliable',
        'No database dependencies'
      ]
    });

  } catch (error) {
    console.error('❌ SIMPLE AUTH INIT: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple authentication initialization endpoint',
    endpoint: '/api/init-simple-auth',
    method: 'POST',
    features: [
      'File-based user storage',
      'Session-based authentication',
      'Simple and reliable',
      'No database dependencies'
    ]
  });
}
