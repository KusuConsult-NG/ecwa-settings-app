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

// Import Neon KV if available
let neonKV: any = null;
let neonKVInitialized = false;

async function initializeNeonKV() {
  if (neonKVInitialized) return neonKV;
  
  try {
    if (process.env.DATABASE_URL) {
      console.log('🔧 Initializing Neon KV...');
      console.log('🔧 DATABASE_URL available:', !!process.env.DATABASE_URL);
      
      const { neonKV: importedNeonKV } = await import('./neon-kv');
      neonKV = importedNeonKV;
      
      // Initialize the database tables
      console.log('🔧 Initializing KV store...');
      await neonKV.initKVStore();
      console.log('✅ Neon KV initialized successfully');
      
      neonKVInitialized = true;
      return neonKV;
    } else {
      console.log('⚠️ DATABASE_URL not available, using file storage');
    }
  } catch (error) {
    console.log('⚠️ Neon KV not available, using file storage:', error.message);
    console.log('⚠️ Error details:', error);
  }
  
  neonKVInitialized = true;
  return null;
}

export class KVError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code: string = "KV_ERROR", statusCode: number = 500) {
    super(message)
    this.name = "KVError"
    this.code = code
    this.statusCode = statusCode
  }
}

const memory = new Map<string, string>()

// Simple file-based storage fallback for development
import fs from 'fs/promises'
import path from 'path'

const STORAGE_FILE = path.join(process.cwd(), '.data', 'users.json')

async function ensureStorageDir() {
  try {
    await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

async function loadFromFile(): Promise<Map<string, string>> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(STORAGE_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    return new Map(Object.entries(parsed))
  } catch (error) {
    return new Map()
  }
}

async function saveToFile(data: Map<string, string>): Promise<void> {
  try {
    await ensureStorageDir()
    const obj = Object.fromEntries(data)
    await fs.writeFile(STORAGE_FILE, JSON.stringify(obj, null, 2))
  } catch (error) {
    console.error('Failed to save to file:', error)
  }
}

async function kvFetch(path: string, init?: RequestInit) {
  const base = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  
  // Fallback to memory storage if KV is not configured
  if (!base || !token) {
    return null
  }

  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      cache: 'no-store',
    })
    
    if (!res.ok) {
      throw new KVError(`KV API error: ${res.status} ${res.statusText}`, "KV_API_ERROR", res.status)
    }
    
    return res
  } catch (error) {
    if (error instanceof KVError) {
      throw error
    }
    throw new KVError(`KV connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, "KV_CONNECTION_ERROR", 500)
  }
}

export const kv = {
  async get(key: string): Promise<string | null> {
    try {
      // Initialize Neon KV if available
      const neon = await initializeNeonKV();
      
      // Use Neon KV if available
      if (neon) {
        console.log(`🔍 Using Neon KV for get: ${key}`);
        const result = await neon.get(key);
        console.log(`🔍 Neon KV result for ${key}:`, result ? 'Found' : 'Not found');
        return result;
      }

      const res = await kvFetch(`/get/${encodeURIComponent(key)}`)
      if (!res) {
        // Fallback to file storage
        const fileData = await loadFromFile()
        return fileData.get(key) ?? null
      }
      
      const data = await res.json()
      return data?.result ?? null
    } catch (error) {
      console.error(`KV get error for key ${key}:`, error)
      // Fallback to file storage on error
      const fileData = await loadFromFile()
      return fileData.get(key) ?? null
    }
  },
  
  async set(key: string, value: string): Promise<void> {
    try {
      // Initialize Neon KV if available
      const neon = await initializeNeonKV();
      
      // Use Neon KV if available
      if (neon) {
        console.log(`💾 Using Neon KV for set: ${key}`);
        await neon.set(key, value);
        console.log(`💾 Neon KV set successful for: ${key}`);
        return;
      }

      const res = await kvFetch(`/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        body: JSON.stringify({ value }),
      })
      
      if (!res) {
        // Fallback to file storage
        const fileData = await loadFromFile()
        fileData.set(key, value)
        await saveToFile(fileData)
        return
      }
      
      // Also store in file as backup
      const fileData = await loadFromFile()
      fileData.set(key, value)
      await saveToFile(fileData)
    } catch (error) {
      console.error(`KV set error for key ${key}:`, error)
      // Fallback to file storage on error
      const fileData = await loadFromFile()
      fileData.set(key, value)
      await saveToFile(fileData)
    }
  },
  
  async delete(key: string): Promise<void> {
    try {
      // Initialize Neon KV if available
      const neon = await initializeNeonKV();
      
      // Use Neon KV if available
      if (neon) {
        await neon.delete(key);
        return;
      }

      const res = await kvFetch(`/del/${encodeURIComponent(key)}`, {
        method: 'POST',
      })
      
      // Always remove from file storage
      const fileData = await loadFromFile()
      fileData.delete(key)
      await saveToFile(fileData)
      
      if (!res) {
        return // File fallback completed
      }
    } catch (error) {
      console.error(`KV delete error for key ${key}:`, error)
      // File fallback completed above
    }
  },
  
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.get(key)
      return value !== null
    } catch (error) {
      console.error(`KV exists error for key ${key}:`, error)
      return false
    }
  }
}


