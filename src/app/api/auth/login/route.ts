import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // TODO: Replace with REAL database lookup.
    // For now, only admin@example.com / admin123 will work.
    const user = await fakeFindUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signJwt({ sub: user.id, role: user.role, email: user.email });

    // IMPORTANT: Set the cookie on the SAME response you return
    const res = NextResponse.json({ ok: true });
    res.cookies.set('auth', token, {
      httpOnly: true,
      secure: true,        // Vercel uses HTTPS
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected' }, { status: 500 });
  }
}

// Mock user; replace with DB user lookup
async function fakeFindUserByEmail(email: string) {
  if (email !== 'admin@example.com') return null;
  // password is "admin123" for this mock
  const passwordHash = await bcrypt.hash('admin123', 10);
  return { id: 'u1', email, role: 'admin', passwordHash };
}