export type UserRecord = {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  passwordHash: string
  createdAt: string
  orgId?: string
  orgName?: string
  role?: string
  lastLogin?: string | null
  isActive?: boolean
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
      const res = await kvFetch(`/get/${encodeURIComponent(key)}`)
      if (!res) {
        // Fallback to memory storage
        return memory.get(key) ?? null
      }
      
      const data = await res.json()
      return data?.result ?? null
    } catch (error) {
      console.error(`KV get error for key ${key}:`, error)
      // Fallback to memory storage on error
      return memory.get(key) ?? null
    }
  },
  
  async set(key: string, value: string): Promise<void> {
    try {
      const res = await kvFetch(`/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        body: JSON.stringify({ value }),
      })
      
      if (!res) {
        // Fallback to memory storage
        memory.set(key, value)
        return
      }
      
      // Also store in memory as backup
      memory.set(key, value)
    } catch (error) {
      console.error(`KV set error for key ${key}:`, error)
      // Fallback to memory storage on error
      memory.set(key, value)
    }
  },
  
  async delete(key: string): Promise<void> {
    try {
      const res = await kvFetch(`/del/${encodeURIComponent(key)}`, {
        method: 'POST',
      })
      
      // Always remove from memory
      memory.delete(key)
      
      if (!res) {
        return // Memory fallback completed
      }
    } catch (error) {
      console.error(`KV delete error for key ${key}:`, error)
      // Memory fallback completed above
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


