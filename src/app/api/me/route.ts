import { NextResponse } from "next/server"
import { signToken, verifyToken } from "@/lib/auth"
import { kv } from "@/lib/kv"

export async function GET(req: Request) {
  const cookie = (req.headers.get("cookie") || "").split(";").find((c) => c.trim().startsWith("cf_token="))
  const token = cookie?.split("=")[1]
  if (!token) return NextResponse.json({ user: null }, { status: 200 })
  try {
    const payload = await verifyToken(token)
    return NextResponse.json({ user: payload })
  } catch {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const cookie = (req.headers.get("cookie") || "").split(";").find((c) => c.trim().startsWith("cf_token="))
    const token = cookie?.split("=")[1]
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const userToken = await verifyToken(token)
    const body = await req.json().catch(() => ({}))
    const { orgId, orgName, role } = body || {}
    if (!orgId || !orgName) return NextResponse.json({ error: "Missing org fields" }, { status: 400 })

    // Update persisted user (if available)
    if (userToken.email) {
      const raw = await kv.get(`user:${userToken.email}`)
      if (raw) {
        const rec = JSON.parse(raw)
        rec.orgId = orgId
        rec.orgName = orgName
        if (role) rec.role = role
        await kv.set(`user:${userToken.email}`, JSON.stringify(rec))
      }
    }

    // Reissue token with org info
    const newToken = await signToken({
      sub: userToken.sub,
      email: userToken.email,
      name: userToken.name,
      orgId,
      orgName,
      role: role || userToken.role,
    })
    const res = NextResponse.json({ ok: true })
    res.headers.set("Set-Cookie", `cf_token=${newToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*7}`)
    return res
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}


