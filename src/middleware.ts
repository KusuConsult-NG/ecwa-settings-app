import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/auth';

// Public routes (no login required)
const PUBLIC = new Set<string>([
  '/', 
  '/login', 
  '/signup', 
  '/reset', 
  '/reset-password', 
  '/verify-login', 
  '/org',
  '/org/gcc',
  '/org/dcc',
  '/org/lcc', 
  '/org/create',
  '/favicon.ico'
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths, auth API routes, static assets, and Next.js internal/static assets
  if (PUBLIC.has(pathname) || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api/public') || 
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/org') ||
      pathname.startsWith('/api/test-auth') ||
      pathname.startsWith('/api/setup-db') ||
      pathname.startsWith('/api/init-db') ||
      pathname.startsWith('/_static') ||
      pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js)$/)) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth')?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) {
    // Don't redirect if already on login page to prevent loops
    if (pathname === '/login') {
      return NextResponse.next();
    }
    
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname); // so we can go back after login
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply to all routes except _next, favicon, api/public, api/auth, api/setup-db, and api/init-db
export const config = {
  matcher: ['/((?!_next|favicon.ico|api/public|api/auth|api/setup-db|api/init-db|_static).*)'],
};