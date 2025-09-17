export type UserRecord = {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: string
}

const memory = new Map<string, string>()

async function kvFetch(path: string, init?: RequestInit) {
  const base = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!base || !token) return null
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`KV error ${res.status}`)
  return res
}

export const kv = {
  async get(key: string): Promise<string | null> {
    const res = await kvFetch(`/get/${encodeURIComponent(key)}`)
    if (!res) return memory.get(key) ?? null
    const data = await res.json()
    return data?.result ?? null
  },
  async set(key: string, value: string): Promise<void> {
    const res = await kvFetch(`/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    })
    if (!res) memory.set(key, value)
  },
}


