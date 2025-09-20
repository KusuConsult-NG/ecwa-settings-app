import { NextResponse } from "next/server"
import { kv, type UserRecord } from "@/lib/kv"
import { signJwt, validateEmail, validatePassword, AuthenticationError } from "@/lib/auth"
import { sql } from '@/lib/database'
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
    const existing = await sql`
      SELECT key FROM kv_store 
      WHERE key = ${`user:${normalizedEmail}`}
      LIMIT 1
    `;
    
    if (existing.length > 0) {
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
      updatedAt: new Date().toISOString(),
      orgId: crypto.randomUUID(), // Generate a unique org ID for the user
      orgName: "ECWA Organization", // Default org name
      role: "Secretary", // Default role for new users
      isActive: true,
      lastLogin: null
    }

    // Save user to database
    await sql`
      INSERT INTO kv_store (key, value, created_at, updated_at)
      VALUES (${`user:${normalizedEmail}`}, ${JSON.stringify(user)}, NOW(), NOW())
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW();
    `;

    // Generate token using new JWT system
    const token = await signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      orgName: user.orgName,
      role: user.role
    })

    // Create response with new cookie system
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

    // Set cookie using new system
    res.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

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


