import { NextResponse } from "next/server"
import { kv, type UserRecord } from "@/lib/kv"
import { validateEmail, AuthenticationError } from "@/lib/auth"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body || {}
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required", code: "MISSING_EMAIL" }, 
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format", code: "INVALID_EMAIL" }, 
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const raw = await kv.get(`user:${normalizedEmail}`)
    if (!raw) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({ 
        ok: true, 
        message: "If an account with that email exists, we've sent a reset link." 
      })
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

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token
    await kv.set(`reset:${resetToken}`, JSON.stringify({
      userId: user.id,
      email: normalizedEmail,
      expiresAt: resetExpiry.toISOString()
    }))

    // In a real application, you would send an email here
    // For now, we'll just log the reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    console.log(`Password reset link for ${normalizedEmail}: ${resetUrl}`)

    return NextResponse.json({ 
      ok: true, 
      message: "If an account with that email exists, we've sent a reset link.",
      // In development, include the reset link for testing
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    })

  } catch (error) {
    console.error("Password reset error:", error)
    
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
