import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return NextResponse.json({
    success: true,
    message: 'Vercel cache test successful!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: true
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({
    success: true,
    message: 'POST request successful!',
    received: body,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: true
  });
}
