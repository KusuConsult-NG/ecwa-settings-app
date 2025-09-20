import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // NEW MIDDLEWARE - BYPASS VERCEL CACHE
  // Allow ALL API routes to work without authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public pages
  if (pathname === '/' || 
      pathname === '/login' || 
      pathname === '/signup' || 
      pathname === '/reset' || 
      pathname === '/reset-password' || 
      pathname === '/verify-login' ||
      pathname.startsWith('/org') ||
      pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/_static') ||
      pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js)$/)) {
    return NextResponse.next();
  }

  // For protected routes, redirect to login
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

// Apply to all routes except static assets
export const config = {
  matcher: [
    '/((?!_next|_static|favicon.ico).*)'
  ],
};
