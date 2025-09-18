import { SignJWT, jwtVerify } from "jose"

function getSecretKey() {
  const secret = process.env.AUTH_SECRET || "dev-secret-please-change-in-production"
  if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET environment variable is required in production")
  }
  return new TextEncoder().encode(secret)
}

export type AppToken = {
  sub: string
  email: string
  name: string
  orgId?: string
  orgName?: string
  role?: string
  iat?: number
  exp?: number
}

export type AuthError = {
  code: string
  message: string
  statusCode: number
}

export class AuthenticationError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code: string = "AUTH_ERROR", statusCode: number = 401) {
    super(message)
    this.name = "AuthenticationError"
    this.code = code
    this.statusCode = statusCode
  }
}

export async function signToken(payload: AppToken): Promise<string> {
  try {
    const key = getSecretKey()
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setSubject(payload.sub)
      .sign(key)
  } catch (error) {
    throw new AuthenticationError("Failed to create token", "TOKEN_CREATION_ERROR", 500)
  }
}

export async function verifyToken(token: string): Promise<AppToken> {
  try {
    if (!token || typeof token !== "string") {
      throw new AuthenticationError("Invalid token format", "INVALID_TOKEN", 401)
    }

    const key = getSecretKey()
    const { payload } = await jwtVerify(token, key)
    
    // Validate required fields
    if (!payload.sub || !payload.email || !payload.name) {
      throw new AuthenticationError("Invalid token payload", "INVALID_TOKEN_PAYLOAD", 401)
    }

    return payload as AppToken
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error
    }
    throw new AuthenticationError("Token verification failed", "TOKEN_VERIFICATION_ERROR", 401)
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}


