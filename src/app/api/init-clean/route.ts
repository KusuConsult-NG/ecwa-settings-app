import { NextResponse } from 'next/server';
import { cleanDb } from '@/lib/clean-db';

export async function POST() {
  try {
    console.log('🔧 CLEAN INIT: Initializing clean database system...');
    
    // Initialize default users
    await cleanDb.initializeDefaultUsers();
    
    return NextResponse.json({
      success: true,
      message: 'Clean database system initialized successfully',
      features: [
        'File-based storage',
        'No external dependencies',
        'Simple and reliable',
        'No database connection issues',
        'Works offline',
        'Clean codebase'
      ]
    });

  } catch (error) {
    console.error('❌ CLEAN INIT: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Clean database initialization endpoint',
    endpoint: '/api/init-clean',
    method: 'POST',
    features: [
      'File-based storage',
      'No external dependencies',
      'Simple and reliable',
      'Clean codebase'
    ]
  });
}
