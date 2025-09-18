import { NextResponse } from "next/server"

export async function POST() {
  try {
    const res = NextResponse.json({ 
      ok: true, 
      message: "Successfully logged out" 
    })
    
    // Clear the authentication cookie
    res.headers.set("Set-Cookie", 
      "cf_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; Secure"
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


