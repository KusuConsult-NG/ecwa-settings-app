import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import bcrypt from 'bcryptjs';
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
    console.log('🔧 INITIALIZING NEW AUTH SYSTEM...');

    // Load existing users
    let users = await loadUsers();
    console.log('👥 Existing users:', users.length);

    // Create admin user if it doesn't exist
    const adminEmail = 'admin@ecwa.com';
    const adminExists = users.find(u => u.email === adminEmail);
    
    if (!adminExists) {
      console.log('👑 Creating admin user...');
      const adminUser: NewUser = {
        id: crypto.randomUUID(),
        email: adminEmail,
        name: 'System Administrator',
        passwordHash: await bcrypt.hash('admin123', 12),
        role: 'admin',
        orgId: crypto.randomUUID(),
        orgName: 'ECWA Organization',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(adminUser);
      await saveUsers(users);
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create test user if it doesn't exist
    const testEmail = 'test@ecwa.com';
    const testExists = users.find(u => u.email === testEmail);
    
    if (!testExists) {
      console.log('🧪 Creating test user...');
      const testUser: NewUser = {
        id: crypto.randomUUID(),
        email: testEmail,
        name: 'Test User',
        passwordHash: await bcrypt.hash('test123', 12),
        role: 'member',
        orgId: crypto.randomUUID(),
        orgName: 'ECWA Organization',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(testUser);
      await saveUsers(users);
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }

    console.log('🎉 NEW AUTH SYSTEM INITIALIZED SUCCESSFULLY');

    return NextResponse.json({
      success: true,
      message: 'New authentication system initialized successfully',
      features: [
        'Bypasses Vercel middleware cache',
        'File-based storage',
        'No external dependencies',
        'Simple and reliable',
        'Works on Vercel',
        'Clean codebase'
      ],
      users: {
        total: users.length,
        admin: users.find(u => u.role === 'admin')?.email || 'Not found',
        test: users.find(u => u.email === 'test@ecwa.com')?.email || 'Not found'
      },
      endpoints: {
        login: '/api/auth/new-login',
        signup: '/api/auth/new-signup',
        init: '/api/init-new-auth'
      }
    });

  } catch (error) {
    console.error('❌ NEW AUTH INIT ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize new auth system',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
