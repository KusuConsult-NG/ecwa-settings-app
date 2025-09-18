import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, type AppToken, AuthenticationError } from "@/lib/auth"

const PROTECTED_PREFIXES = ["/dashboard", "/expenditures", "/income", "/reports", "/audit", "/settings", "/hr", "/org"]

// Role-based access control
const ROLE_PERMISSIONS = {
  // HQ roles can create DCCs
  "/org/dcc": ["President", "General Secretary", "Treasurer"],
  // DCC roles can create LCCs
  "/org/lcc": ["President", "General Secretary", "Treasurer", "Chairman", "Secretary"],
  // LCC roles can create LCs
  "/org/create": ["President", "General Secretary", "Treasurer", "Chairman", "Secretary", "LO"],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Check if the path needs authentication
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!needsAuth) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = req.cookies.get("cf_token")?.value
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  try {
    const user = await verifyToken(token) as AppToken
    
    // Validate user has required fields
    if (!user.sub || !user.email || !user.name) {
      throw new AuthenticationError("Invalid user token", "INVALID_USER_TOKEN", 401)
    }
    
    // Check role-based access for org creation pages
    for (const [path, allowedRoles] of Object.entries(ROLE_PERMISSIONS)) {
      if (pathname.startsWith(path)) {
        if (!user.role || !allowedRoles.includes(user.role)) {
          const dashboardUrl = new URL("/dashboard", req.url)
          dashboardUrl.searchParams.set("error", "insufficient-permissions")
          return NextResponse.redirect(dashboardUrl)
        }
        break
      }
    }
    
    // Add user info to headers for use in API routes
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", user.sub)
    requestHeaders.set("x-user-email", user.email)
    requestHeaders.set("x-user-role", user.role || "")
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Middleware authentication error:", error)
    
    // Clear invalid token and redirect to login
    const res = NextResponse.redirect(new URL("/login", req.url))
    res.cookies.delete("cf_token")
    return res
  }
}

export const config = {
  matcher: ["/(dashboard|expenditures|income|reports|audit|settings|hr|org)(.*)"],
}


