import { NextResponse } from 'next/server';
import { createTables } from '@/lib/database';

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL not configured. Please set DATABASE_URL environment variable.',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

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
