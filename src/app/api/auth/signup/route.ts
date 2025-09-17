import { NextResponse } from "next/server"
import { kv, type UserRecord } from "@/lib/kv"
import crypto from "crypto"
import { signToken } from "@/lib/auth"

function hashPassword(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body || {}
    if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const existing = await kv.get(`user:${email}`)
    if (existing) return NextResponse.json({ error: "User exists" }, { status: 409 })

    const user: UserRecord & { orgId?: string; orgName?: string; role?: string } = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      role: "Secretary", // Default role for new users
    }
    await kv.set(`user:${email}`, JSON.stringify(user))
    const token = await signToken({ sub: user.id, email: user.email, name: user.name, role: user.role })
    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } })
    res.headers.set("Set-Cookie", `cf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*7}`)
    return res
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}


