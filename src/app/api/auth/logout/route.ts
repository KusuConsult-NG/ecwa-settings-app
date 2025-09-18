import { NextResponse } from "next/server"

export async function POST() {
  try {
    const res = NextResponse.json({ 
      ok: true, 
      message: "Successfully logged out" 
    })
    
    // Clear the authentication cookie
    const isProduction = process.env.NODE_ENV === 'production'
    res.headers.set("Set-Cookie", 
      `cf_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${isProduction ? '; Secure' : ''}`
    )
    
    return res
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" }, 
      { status: 500 }
    )
  }
}


