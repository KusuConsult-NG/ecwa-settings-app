"use client"
import { useState, useEffect, Suspense } from "react"

interface ResetError {
  message: string
  code?: string
  details?: string[]
}

function ResetForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ResetError | null>(null)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!email.trim()) {
      setError({ message: "Email is required", code: "MISSING_EMAIL" })
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Reset request failed")
      }

      setSuccess(true)
    } catch (err: any) {
      setError({
        message: err.message || "An unexpected error occurred",
        code: "RESET_FAILED"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <section className="container">
        <div className="auth card" style={{ backgroundColor: "transparent", color: "white" }}>
          <h2 style={{ color: "white" }}>Reset Password</h2>
          <form className="row">
            <div>
              <label htmlFor="email" style={{ color: "white" }}>Email*</label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@church.org"
                autoComplete="email"
                disabled
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
              />
            </div>
          </form>
          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
            <a className="btn ghost" href="/login" style={{ color: "white" }}>Back to Login</a>
            <button className="btn primary" disabled>Send Reset Link</button>
          </div>
        </div>
      </section>
    )
  }

  if (success) {
    return (
      <section className="container">
        <div className="auth card" style={{ backgroundColor: "transparent", color: "white" }}>
          <h2 style={{ color: "white" }}>Reset Link Sent</h2>
          <div style={{ color: "#10B981", marginBottom: "1rem", padding: "0.75rem", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.375rem" }}>
            <div style={{ fontWeight: "500" }}>Check your email</div>
            <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
              We've sent a password reset link to <strong>{email}</strong>
            </div>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
            <a className="btn ghost" href="/login" style={{ color: "white" }}>Back to Login</a>
            <button 
              className="btn primary" 
              onClick={() => {
                setSuccess(false)
                setEmail("")
              }}
            >
              Send Another
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="auth card" style={{ backgroundColor: "transparent", color: "white" }}>
        <h2 style={{ color: "white" }}>Reset Password</h2>
        <p style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={onSubmit} className="row">
          <div>
            <label htmlFor="email" style={{ color: "white" }}>Email*</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@church.org"
              disabled={loading}
              autoComplete="email"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
            />
          </div>
        </form>
        
        {error && (
          <div style={{ color: "#FCA5A5", marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: "0.375rem" }}>
            <div style={{ fontWeight: "500" }}>{error.message}</div>
            {error.details && error.details.length > 0 && (
              <ul style={{ marginTop: "0.25rem", paddingLeft: "1rem" }}>
                {error.details.map((detail, index) => (
                  <li key={index} style={{ fontSize: "0.875rem" }}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
          <a className="btn ghost" href="/login" style={{ color: "white" }}>Back to Login</a>
          <button 
            className="btn primary" 
            disabled={loading || !email.trim()}
            onClick={onSubmit}
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </div>
      </div>
    </section>
  )
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetForm />
    </Suspense>
  )
}
