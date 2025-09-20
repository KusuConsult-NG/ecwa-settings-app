import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

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
    const { email, password, name, role = 'member', orgName = 'ECWA Organization' } = await req.json();
    console.log('🔐 NEW SIGNUP ATTEMPT:', email);

    if (!email || !password || !name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, password, and name are required' 
      }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('📧 Normalized email:', normalizedEmail);

    // Load existing users
    const users = await loadUsers();
    console.log('👥 Total users loaded:', users.length);

    // Check if user already exists
    const existingUser = users.find(u => u.email === normalizedEmail);
    if (existingUser) {
      console.log('❌ User already exists:', normalizedEmail);
      return NextResponse.json({ 
        success: false, 
        error: 'User already exists' 
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('🔑 Password hashed');

    // Create new user
    const newUser: NewUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      role: role.trim(),
      orgId: crypto.randomUUID(),
      orgName: orgName.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add user to list
    users.push(newUser);
    await saveUsers(users);
    console.log('💾 User saved to database');

    // Generate JWT token
    const token = await signJwt({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      orgId: newUser.orgId,
      orgName: newUser.orgName
    });

    console.log('🎫 JWT token generated');

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Signup successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        orgId: newUser.orgId,
        orgName: newUser.orgName
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

    console.log('✅ SIGNUP SUCCESSFUL');
    return response;

  } catch (error) {
    console.error('❌ NEW SIGNUP ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
