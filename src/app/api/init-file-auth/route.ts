import { NextResponse } from 'next/server';
import { initializeDefaultUsers } from '@/lib/file-auth';

export async function POST() {
  try {
    console.log('🔧 FILE AUTH INIT: Initializing file-based authentication system...');
    
    // Initialize default users
    initializeDefaultUsers();
    
    return NextResponse.json({
      success: true,
      message: 'File-based authentication system initialized successfully',
      features: [
        'File-based user storage',
        'Session-based authentication',
        'Simple and reliable',
        'No database dependencies',
        'Works offline'
      ]
    });

  } catch (error) {
    console.error('❌ FILE AUTH INIT: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'File-based authentication initialization endpoint',
    endpoint: '/api/init-file-auth',
    method: 'POST',
    features: [
      'File-based user storage',
      'Session-based authentication',
      'Simple and reliable',
      'No database dependencies'
    ]
  });
}
