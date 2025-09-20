import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all API routes - this is the key fix
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

  // Check authentication for protected routes
  const token = req.cookies.get('auth')?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Simplified matcher - only apply to non-API routes
export const config = {
  matcher: [
    '/((?!api|_next|_static|favicon.ico).*)'
  ],
};