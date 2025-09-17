import { SignJWT, jwtVerify } from "jose"

const SECRET = (process.env.AUTH_SECRET || "dev-secret-please-change") as string
const KEY = new TextEncoder().encode(SECRET)

export type AppToken = {
  sub: string
  email: string
  name: string
  orgId?: string
  orgName?: string
  role?: string
}

export async function signToken(payload: AppToken) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(KEY)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, KEY)
  return payload as unknown as AppToken
}


