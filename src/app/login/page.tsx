"use client"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="auth card">
        <h2>Log In</h2>
        <form onSubmit={onSubmit} className="row">
          <div><label>Email*</label><input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@church.org" /></div>
          <div><label>Password*</label><input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" /></div>
        </form>
        {error && <div style={{color:"#DC2626", marginTop:"0.5rem"}}>{error}</div>}
        <div style={{marginTop:"1rem",display:"flex",gap:".5rem",justifyContent:"space-between",alignItems:"center"}}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/reset" className="muted">Forgot password?</a>
          <button className="btn primary" onClick={onSubmit as any} disabled={loading}>{loading?"Logging in…":"Log In"}</button>
        </div>
        <div style={{marginTop:"1rem"}} className="muted">No account? {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}<a href="/signup">Sign up</a></div>
      </div>
    </section>
  )
}


