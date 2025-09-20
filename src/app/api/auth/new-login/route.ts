import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface NewUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  orgId: string;
  orgName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

const DATA_DIR = join(process.cwd(), '.data');
const USERS_FILE = join(DATA_DIR, 'new-users.json');

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function loadUsers(): Promise<NewUser[]> {
  try {
    await ensureDataDir();
    const data = await readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveUsers(users: NewUser[]) {
  await ensureDataDir();
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log('🔐 NEW LOGIN ATTEMPT:', email);

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('📧 Normalized email:', normalizedEmail);

    // Load users
    const users = await loadUsers();
    console.log('👥 Total users loaded:', users.length);

    // Find user
    const user = users.find(u => u.email === normalizedEmail);
    if (!user) {
      console.log('❌ User not found:', normalizedEmail);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    console.log('✅ User found:', { email: user.email, name: user.name, isActive: user.isActive });

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is deactivated');
      return NextResponse.json({ 
        success: false, 
        error: 'Account is deactivated' 
      }, { status: 401 });
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('🔑 Password verification result:', passwordMatch);

    if (!passwordMatch) {
      console.log('❌ Password verification failed');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    
    // Save updated user
    await saveUsers(users);
    console.log('💾 User data updated');

    // Generate JWT token
    const token = await signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
      orgName: user.orgName
    });

    console.log('🎫 JWT token generated');

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
        orgName: user.orgName
      }
    });

    // Set cookie
    response.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log('✅ LOGIN SUCCESSFUL');
    return response;

  } catch (error) {
    console.error('❌ NEW LOGIN ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
