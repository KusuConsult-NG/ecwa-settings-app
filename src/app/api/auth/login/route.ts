import { NextResponse } from "next/server"
import { kv, type UserRecord } from "@/lib/kv"
import { signToken, validateEmail, AuthenticationError } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const { email, password } = body || {}
    
    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required", code: "MISSING_FIELDS" }, 
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format", code: "INVALID_EMAIL" }, 
        { status: 400 }
      )
    }

    if (password.length < 1) {
      return NextResponse.json(
        { error: "Password is required", code: "INVALID_PASSWORD" }, 
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Get user from storage
    const raw = await kv.get(`user:${normalizedEmail}`)
    console.log(`Login attempt for ${normalizedEmail}, found user data:`, raw ? "YES" : "NO")
    if (!raw) {
      return NextResponse.json(
        { error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, 
        { status: 401 }
      )
    }

    let user: UserRecord
    try {
      user = JSON.parse(raw)
    } catch (parseError) {
      console.error("Failed to parse user data:", parseError)
      return NextResponse.json(
        { error: "Invalid user data", code: "INVALID_USER_DATA" }, 
        { status: 500 }
      )
    }

    // Check if user is active
    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Account is deactivated", code: "ACCOUNT_DEACTIVATED" }, 
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, 
        { status: 401 }
      )
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    await kv.set(`user:${normalizedEmail}`, JSON.stringify(user))

    // Generate token
    const token = await signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      orgName: user.orgName,
      role: user.role
    })

    // Create response
    const res = NextResponse.json({ 
      ok: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        orgName: user.orgName
      } 
    })

    // Set secure cookie
    const isProduction = process.env.NODE_ENV === 'production'
    res.headers.set("Set-Cookie", 
      `cf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*7}${isProduction ? '; Secure' : ''}`
    )

    return res

  } catch (error) {
    console.error("Login error:", error)
    
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


