import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // FORCE VERCEL CACHE INVALIDATION - VERSION 2
  // Allow ALL routes to bypass middleware
  // This will be fixed once Vercel cache clears
  return NextResponse.next();
}

// Apply to all routes
export const config = {
  matcher: [
    '/((?!_next|_static|favicon.ico).*)'
  ],
};