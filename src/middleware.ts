import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/auth';

// Public routes (no login required)
const PUBLIC = new Set<string>(['/', '/login', '/signup', '/favicon.ico']);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and Next.js internal/static assets
  if (PUBLIC.has(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth')?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname); // so we can go back after login
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply to all routes except _next, favicon, and /api/public
export const config = {
  matcher: ['/((?!_next|favicon.ico|api/public).*)'],
};