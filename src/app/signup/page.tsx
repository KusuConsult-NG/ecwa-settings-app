"use client"
import { useState } from "react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Signup failed")
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
        <h2>Sign Up & Create Organization</h2>
        <form onSubmit={onSubmit} className="row">
          <div><label>Full name*</label><input required value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" /></div>
          <div><label>Email*</label><input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@church.org" /></div>
        </form>
        <div className="row">
          <div><label>Password*</label><input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" /></div>
          <div><label>Confirm password*</label><input type="password" placeholder="••••••••" /></div>
        </div>
        {error && <div style={{color:"#DC2626", marginTop:"0.5rem"}}>{error}</div>}
        <div style={{marginTop:"1rem",display:"flex",gap:".5rem",justifyContent:"flex-end"}}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn ghost" href="/">Cancel</a>
          <button className="btn primary" onClick={onSubmit as any} disabled={loading}>{loading?"Creating…":"Create"}</button>
        </div>
      </div>
    </section>
  )
}


