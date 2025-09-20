// Clean database system - no external dependencies
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Database file path
const DB_FILE = path.join(process.cwd(), '.data', 'clean-database.json');

// User interface
export interface CleanUser {
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

// Database interface
interface CleanDatabase {
  users: CleanUser[];
  organizations: any[];
  agencies: any[];
  staff: any[];
  leaders: any[];
  lc: any[];
  lcc: any[];
  leave_requests: any[];
  payroll: any[];
  queries: any[];
  expenditures: any[];
  income: any[];
  bank_accounts: any[];
  executives: any[];
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load database from file
function loadDatabase(): CleanDatabase {
  try {
    ensureDataDir();
    if (!fs.existsSync(DB_FILE)) {
      return {
        users: [],
        organizations: [],
        agencies: [],
        staff: [],
        leaders: [],
        lc: [],
        lcc: [],
        leave_requests: [],
        payroll: [],
        queries: [],
        expenditures: [],
        income: [],
        bank_accounts: [],
        executives: []
      };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading database:', error);
    return {
      users: [],
      organizations: [],
      agencies: [],
      staff: [],
      leaders: [],
      lc: [],
      lcc: [],
      leave_requests: [],
      payroll: [],
      queries: [],
      expenditures: [],
      income: [],
      bank_accounts: [],
      executives: []
    };
  }
}

// Save database to file
function saveDatabase(db: CleanDatabase): void {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
    throw error;
  }
}

// User operations
export const cleanDb = {
  // Get all users
  getUsers(): CleanUser[] {
    const db = loadDatabase();
    return db.users;
  },

  // Find user by email
  findUserByEmail(email: string): CleanUser | null {
    const users = this.getUsers();
    return users.find(user => user.email === email.toLowerCase().trim()) || null;
  },

  // Create new user
  createUser(userData: Omit<CleanUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>): CleanUser {
    const db = loadDatabase();
    
    // Check if user already exists
    if (db.users.find(user => user.email === userData.email)) {
      throw new Error('User already exists');
    }
    
    const newUser: CleanUser = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    db.users.push(newUser);
    saveDatabase(db);
    return newUser;
  },

  // Update user
  updateUser(email: string, updates: Partial<CleanUser>): CleanUser | null {
    const db = loadDatabase();
    const userIndex = db.users.findIndex(user => user.email === email.toLowerCase().trim());
    
    if (userIndex === -1) {
      return null;
    }
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    saveDatabase(db);
    return db.users[userIndex];
  },

  // Authenticate user
  async authenticateUser(email: string, password: string): Promise<CleanUser | null> {
    const user = this.findUserByEmail(email);
    
    if (!user || !user.isActive) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }
    
    // Update last login
    this.updateUser(email, { lastLogin: new Date().toISOString() });
    
    return user;
  },

  // Initialize with default admin user
  async initializeDefaultUsers(): Promise<void> {
    const db = loadDatabase();
    
    // Check if admin user exists
    if (!db.users.find(user => user.email === 'admin@example.com')) {
      const adminUser: CleanUser = {
        id: crypto.randomUUID(),
        email: 'admin@example.com',
        name: 'Admin User',
        phone: '1234567890',
        address: 'Admin Address',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'Admin',
        orgId: crypto.randomUUID(),
        orgName: 'ECWA Organization',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      };
      
      db.users.push(adminUser);
      saveDatabase(db);
      console.log('✅ Default admin user created');
    }
  },

  // Get all data
  getAllData(): CleanDatabase {
    return loadDatabase();
  },

  // Clear all data (for testing)
  clearAllData(): void {
    const emptyDb: CleanDatabase = {
      users: [],
      organizations: [],
      agencies: [],
      staff: [],
      leaders: [],
      lc: [],
      lcc: [],
      leave_requests: [],
      payroll: [],
      queries: [],
      expenditures: [],
      income: [],
      bank_accounts: [],
      executives: []
    };
    saveDatabase(emptyDb);
  }
};
