import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, type AppToken } from "@/lib/auth"

const PROTECTED_PREFIXES = ["/dashboard", "/expenditures", "/income", "/reports", "/audit", "/settings", "/hr", "/org"]

// Role-based access control
const ROLE_PERMISSIONS = {
  // HQ roles can create DCCs
  "/org/dcc": ["President", "General Secretary", "Treasurer"],
  // DCC roles can create LCCs
  "/org/lcc": ["President", "General Secretary", "Treasurer", "Chairman", "Secretary"],
  // LCC roles can create LCs
  "/org/create": ["President", "General Secretary", "Treasurer", "Chairman", "Secretary", "LO", "Secretary"],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!needsAuth) return NextResponse.next()

  const token = req.cookies.get("cf_token")?.value
  if (!token) return NextResponse.redirect(new URL("/login", req.url))
  
  try {
    const user = await verifyToken(token) as AppToken
    
    // Check role-based access for org creation pages
    for (const [path, allowedRoles] of Object.entries(ROLE_PERMISSIONS)) {
      if (pathname.startsWith(path)) {
        if (!user.role || !allowedRoles.includes(user.role)) {
          return NextResponse.redirect(new URL("/dashboard?error=insufficient-permissions", req.url))
        }
        break
      }
    }
    
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url))
    res.cookies.delete("cf_token")
    return res
  }
}

export const config = {
  matcher: ["/(dashboard|expenditures|income|reports|audit|settings|hr|org)(.*)"],
}


