import { NextResponse } from "next/server"
import { kv, type UserRecord } from "@/lib/kv"
import { signToken, validateEmail, validatePassword, AuthenticationError } from "@/lib/auth"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const { name, email, phone, address, password } = body || {}
    
    // Input validation
    if (!name || !email || !phone || !address || !password) {
      return NextResponse.json(
        { error: "Name, email, phone, address, and password are required", code: "MISSING_FIELDS" }, 
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format", code: "INVALID_EMAIL" }, 
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: "Password does not meet requirements", 
          code: "WEAK_PASSWORD",
          details: passwordValidation.errors
        }, 
        { status: 400 }
      )
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters long", code: "INVALID_NAME" }, 
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedName = name.trim()
    const normalizedPhone = phone.trim()
    const normalizedAddress = address.trim()

    // Check if user already exists
    const existing = await kv.get(`user:${normalizedEmail}`)
    if (existing) {
      return NextResponse.json(
        { error: "User already exists with this email", code: "USER_EXISTS" }, 
        { status: 409 }
      )
    }

    // Hash password with bcrypt
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user record
    const user: UserRecord = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: normalizedName,
      phone: normalizedPhone,
      address: normalizedAddress,
      passwordHash,
      createdAt: new Date().toISOString(),
      orgId: crypto.randomUUID(), // Generate a unique org ID for the user
      orgName: `${normalizedName}'s Organization`, // Default org name
      role: "Secretary", // Default role for new users
      isActive: true,
      lastLogin: null
    }

    // Save user to storage
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
    const cookieString = `cf_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*7}${isProduction ? '; Secure' : ''}`
    res.headers.set("Set-Cookie", cookieString)
    
    console.log("Signup: Cookie set:", cookieString.substring(0, 50) + "...")
    console.log("Signup: User created and stored for", normalizedEmail)

    return res

  } catch (error) {
    console.error("Signup error:", error)
    
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


