import { NextResponse } from "next/server"
import { kv } from "@/lib/kv"

// Basic org storage in KV (or memory fallback). Keys:
// org:GCC:id, org:DCC:id, org:LCC:id, org:LC:id
// parent relationships stored in each record

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const parentId = searchParams.get('parentId')
  const raw = await kv.get(`org:index`)
  const index = raw ? JSON.parse(raw) as any[] : []
  const filtered = index.filter((o) => (!type || o.type===type) && (!parentId || o.parentId===parentId))
  return NextResponse.json({ items: filtered })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { id, name, type, parentId } = body || {}
  if (!name || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const raw = await kv.get(`org:index`)
  const index = raw ? JSON.parse(raw) as any[] : []
  const newId = id || `${type}-${Math.random().toString(36).slice(2,8)}`
  const rec = { id: newId, name, type, parentId }
  index.push(rec)
  await kv.set(`org:index`, JSON.stringify(index))
  await kv.set(`org:${newId}`, JSON.stringify(rec))
  return NextResponse.json({ ok: true, org: rec })
}


