import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/auth';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Simple file-based user storage
const USERS_FILE = path.join(process.cwd(), '.data', 'users-simple.json');

interface SimpleUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  passwordHash: string;
  role: string;
  orgId: string;
  orgName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load users from file
function loadUsers(): SimpleUser[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

// Save users to file
function saveUsers(users: SimpleUser[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
}

// Find user by email
export function findUserByEmail(email: string): SimpleUser | null {
  const users = loadUsers();
  return users.find(user => user.email === email.toLowerCase().trim()) || null;
}

// Create new user
export function createUser(userData: Omit<SimpleUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): SimpleUser {
  const users = loadUsers();
  
  // Check if user already exists
  if (users.find(user => user.email === userData.email)) {
    throw new Error('User already exists');
  }
  
  const newUser: SimpleUser = {
    ...userData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: null
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// Update user
export function updateUser(email: string, updates: Partial<SimpleUser>): SimpleUser | null {
  const users = loadUsers();
  const userIndex = users.findIndex(user => user.email === email.toLowerCase().trim());
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveUsers(users);
  return users[userIndex];
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<SimpleUser | null> {
  const user = findUserByEmail(email);
  
  if (!user || !user.isActive) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }
  
  // Update last login
  updateUser(email, { lastLogin: new Date().toISOString() });
  
  return user;
}

// Create authentication response with cookie
export async function createAuthResponse(user: SimpleUser): Promise<NextResponse> {
  const token = await signJwt({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    orgId: user.orgId,
    orgName: user.orgName
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
      orgName: user.orgName
    }
  });

  response.cookies.set('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });

  return response;
}

// Initialize with default admin user
export function initializeDefaultUsers(): void {
  const users = loadUsers();
  
  // Check if admin user exists
  if (!users.find(user => user.email === 'admin@example.com')) {
    const adminUser = {
      email: 'admin@example.com',
      name: 'Admin User',
      phone: '1234567890',
      address: 'Test Address',
      passwordHash: '', // Will be set below
      role: 'Admin',
      orgId: crypto.randomUUID(),
      orgName: 'ECWA Organization',
      isActive: true
    };
    
    // Hash password
    bcrypt.hash('password123', 12).then(hash => {
      adminUser.passwordHash = hash;
      createUser(adminUser);
      console.log('✅ Default admin user created');
    });
  }
}
