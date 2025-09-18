import { NextResponse } from "next/server"
import { signToken, verifyToken, AuthenticationError } from "@/lib/auth"
import { kv, type UserRecord } from "@/lib/kv"

function getTokenFromRequest(req: Request): string | null {
  const cookie = req.headers.get("cookie")
  if (!cookie) return null
  
  const tokenCookie = cookie
    .split(";")
    .find((c) => c.trim().startsWith("cf_token="))
  
  return tokenCookie?.split("=")[1] || null
}

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const payload = await verifyToken(token)
    return NextResponse.json({ user: payload })
  } catch (error) {
    console.error("GET /api/me error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated", code: "NOT_AUTHENTICATED" }, 
        { status: 401 }
      )
    }

    const userToken = await verifyToken(token)
    const body = await req.json().catch(() => ({}))
    const { orgId, orgName, role } = body || {}
    
    if (!orgId || !orgName) {
      return NextResponse.json(
        { error: "Organization ID and name are required", code: "MISSING_ORG_FIELDS" }, 
        { status: 400 }
      )
    }

    // Validate role if provided
    const validRoles = ["admin", "President", "General Secretary", "Treasurer", "Chairman", "Secretary", "LO"]
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role", code: "INVALID_ROLE" }, 
        { status: 400 }
      )
    }

    // Update persisted user (if available)
    if (userToken.email) {
      const raw = await kv.get(`user:${userToken.email}`)
      if (raw) {
        try {
          const user: UserRecord = JSON.parse(raw)
          user.orgId = orgId
          user.orgName = orgName
          if (role) user.role = role
          
          await kv.set(`user:${userToken.email}`, JSON.stringify(user))
        } catch (parseError) {
          console.error("Failed to parse user data:", parseError)
          return NextResponse.json(
            { error: "Invalid user data", code: "INVALID_USER_DATA" }, 
            { status: 500 }
          )
        }
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

    const res = NextResponse.json({ 
      ok: true, 
      message: "Organization updated successfully" 
    })
    
    res.headers.set("Set-Cookie", 
      `cf_token=${newToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*7}; Secure`
    )
    
    return res
  } catch (error) {
    console.error("POST /api/me error:", error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message, code: error.code }, 
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" }, 
      { status: 500 }
    )
  }
}


