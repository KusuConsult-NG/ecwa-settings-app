import { NextResponse } from 'next/server';
import { createTables } from '@/lib/database';

export async function POST() {
  try {
    console.log('🔧 Setting up database tables...');
    await createTables();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Database setup endpoint. Use POST to initialize tables.',
    endpoint: '/api/setup-db',
    method: 'POST'
  });
}
