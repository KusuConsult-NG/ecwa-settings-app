import { sql } from './database';

// Check if database is available
const isDatabaseAvailable = () => {
  const available = sql !== null && process.env.DATABASE_URL;
  console.log('🔍 Database availability check:', { 
    sqlAvailable: sql !== null, 
    databaseUrl: !!process.env.DATABASE_URL,
    overall: available 
  });
  return available;
};

export type UserRecord = {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  passwordHash: string
  createdAt: string
  updatedAt: string
  orgId?: string
  orgName?: string
  role?: string
  lastLogin?: string | null
  isActive?: boolean
}

export class NeonKVError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code: string = "NEON_KV_ERROR", statusCode: number = 500) {
    super(message)
    this.name = "NeonKVError"
    this.code = code
    this.statusCode = statusCode
  }
}

// Neon-based KV storage implementation
export const neonKV = {
  async get(key: string): Promise<string | null> {
    try {
      if (!isDatabaseAvailable()) {
        throw new NeonKVError('Database not available');
      }
      
      const result = await sql!`
        SELECT value FROM kv_store 
        WHERE key = ${key} 
        LIMIT 1
      `;
      
      return result[0]?.value || null;
    } catch (error) {
      console.error(`Neon KV get error for key ${key}:`, error);
      throw new NeonKVError(`Failed to get key ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  async set(key: string, value: string): Promise<void> {
    try {
      if (!isDatabaseAvailable()) {
        throw new NeonKVError('Database not available');
      }
      
      await sql!`
        INSERT INTO kv_store (key, value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = EXCLUDED.value,
          updated_at = NOW()
      `;
    } catch (error) {
      console.error(`Neon KV set error for key ${key}:`, error);
      throw new NeonKVError(`Failed to set key ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  async delete(key: string): Promise<void> {
    try {
      if (!isDatabaseAvailable()) {
        throw new NeonKVError('Database not available');
      }
      
      await sql!`
        DELETE FROM kv_store 
        WHERE key = ${key}
      `;
    } catch (error) {
      console.error(`Neon KV delete error for key ${key}:`, error);
      throw new NeonKVError(`Failed to delete key ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  async exists(key: string): Promise<boolean> {
    try {
      if (!isDatabaseAvailable()) {
        return false;
      }
      
      const result = await sql!`
        SELECT 1 FROM kv_store 
        WHERE key = ${key} 
        LIMIT 1
      `;
      return result.length > 0;
    } catch (error) {
      console.error(`Neon KV exists error for key ${key}:`, error);
      return false;
    }
  },

  // User-specific methods
  async getUser(email: string): Promise<UserRecord | null> {
    try {
      if (!isDatabaseAvailable()) {
        throw new NeonKVError('Database not available');
      }
      
      const result = await sql!`
        SELECT * FROM users 
        WHERE email = ${email.toLowerCase().trim()}
        LIMIT 1
      `;
      
      if (result.length === 0) return null;
      
      const user = result[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        passwordHash: user.password_hash,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
        orgId: user.org_id,
        orgName: user.org_name,
        role: user.role,
        lastLogin: user.last_login?.toISOString() || null,
        isActive: user.is_active
      };
    } catch (error) {
      console.error(`Neon KV getUser error for email ${email}:`, error);
      throw new NeonKVError(`Failed to get user ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async setUser(user: UserRecord): Promise<void> {
    try {
      if (!isDatabaseAvailable()) {
        throw new NeonKVError('Database not available');
      }
      
      await sql!`
        INSERT INTO users (
          id, email, name, phone, address, password_hash, 
          role, org_id, org_name, is_active, created_at, updated_at, last_login
        )
        VALUES (
          ${user.id}, ${user.email.toLowerCase().trim()}, ${user.name}, 
          ${user.phone || null}, ${user.address || null}, ${user.passwordHash},
          ${user.role || 'User'}, ${user.orgId || null}, ${user.orgName || null}, 
          ${user.isActive ?? true}, ${user.createdAt}, ${user.updatedAt}, 
          ${user.lastLogin ? new Date(user.lastLogin) : null}
        )
        ON CONFLICT (email) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          org_id = EXCLUDED.org_id,
          org_name = EXCLUDED.org_name,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at,
          last_login = EXCLUDED.last_login
      `;
    } catch (error) {
      console.error(`Neon KV setUser error for user ${user.email}:`, error);
      throw new NeonKVError(`Failed to set user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Initialize KV store table
  async initKVStore(): Promise<void> {
    try {
      console.log('🔧 Initializing KV store...');
      console.log('🔧 Database available:', isDatabaseAvailable());
      
      if (!isDatabaseAvailable()) {
        console.log('❌ Database not available for KV store initialization');
        throw new NeonKVError('Database not available');
      }
      
      console.log('🔧 Creating kv_store table...');
      await sql!`
        CREATE TABLE IF NOT EXISTS kv_store (
          key VARCHAR(255) PRIMARY KEY,
          value TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      console.log('✅ KV store table initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing KV store:', error);
      throw error;
    }
  }
};
