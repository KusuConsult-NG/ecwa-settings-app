import { NextResponse } from "next/server"
import { kv, type UserRecord } from "@/lib/kv"
import { validatePassword, AuthenticationError } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = body || {}
    
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required", code: "MISSING_FIELDS" }, 
        { status: 400 }
      )
    }

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

    // Get reset token data
    const resetDataRaw = await kv.get(`reset:${token}`)
    if (!resetDataRaw) {
      return NextResponse.json(
        { error: "Invalid or expired reset token", code: "INVALID_TOKEN" }, 
        { status: 400 }
      )
    }

    let resetData: { userId: string; email: string; expiresAt: string }
    try {
      resetData = JSON.parse(resetDataRaw)
    } catch (parseError) {
      console.error("Failed to parse reset data:", parseError)
      return NextResponse.json(
        { error: "Invalid reset token data", code: "INVALID_TOKEN_DATA" }, 
        { status: 500 }
      )
    }

    // Check if token has expired
    const now = new Date()
    const expiresAt = new Date(resetData.expiresAt)
    if (now > expiresAt) {
      // Clean up expired token
      await kv.delete(`reset:${token}`)
      return NextResponse.json(
        { error: "Reset token has expired", code: "TOKEN_EXPIRED" }, 
        { status: 400 }
      )
    }

    // Get user data
    const userRaw = await kv.get(`user:${resetData.email}`)
    if (!userRaw) {
      return NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" }, 
        { status: 404 }
      )
    }

    let user: UserRecord
    try {
      user = JSON.parse(userRaw)
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

    // Hash new password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Update user with new password
    user.passwordHash = passwordHash
    await kv.set(`user:${resetData.email}`, JSON.stringify(user))

    // Clean up reset token
    await kv.delete(`reset:${token}`)

    return NextResponse.json({ 
      ok: true, 
      message: "Password has been reset successfully" 
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
