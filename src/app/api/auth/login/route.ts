import { NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import crypto from "crypto"
import { signToken } from "@/lib/auth"

function hashPassword(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    const raw = await kv.get(`user:${email}`)
    if (!raw) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    const user = JSON.parse(raw)
    if (user.passwordHash !== hashPassword(password)) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    const token = await signToken({ sub: user.id, email: user.email, name: user.name, orgId: user.orgId, orgName: user.orgName, role: user.role })
    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } })
    res.headers.set("Set-Cookie", `cf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*7}`)
    return res
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}


