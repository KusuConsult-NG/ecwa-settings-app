"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"

interface LoginError {
  message: string
  code?: string
  details?: string[]
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()

  // Check for redirect parameter
  const redirect = searchParams?.get("redirect") || "/dashboard"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check for error parameter from middleware
  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam === "insufficient-permissions") {
      setError({
        message: "You don't have permission to access that page",
        code: "INSUFFICIENT_PERMISSIONS"
      })
    }
  }, [searchParams])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Basic client-side validation
    if (!email.trim()) {
      setError({ message: "Email is required", code: "MISSING_EMAIL" })
      setLoading(false)
      return
    }

    if (!password) {
      setError({ message: "Password is required", code: "MISSING_PASSWORD" })
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      })
      
      const data = await res.json()
      
             if (!res.ok) {
               throw new Error(data.error || "Login failed")
             }

             console.log("Login successful, redirecting to:", redirect)
             console.log("Redirecting in 500ms...")

             // Longer delay to ensure cookie is set before redirect
             setTimeout(() => {
               console.log("Redirecting now...")
               window.location.href = redirect
             }, 500)
    } catch (err: any) {
      setError({
        message: err.message || "An unexpected error occurred",
        code: "LOGIN_FAILED"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <section className="container">
        <div className="auth card">
          <h2>Log In</h2>
          <form>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="email">Email*</label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@church.org"
                autoComplete="email"
                disabled
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="password">Password*</label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
                disabled
              />
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "space-between", alignItems: "center" }}>
              <a href="/reset">Forgot password?</a>
              <button className="btn primary" disabled>Log In</button>
            </div>
          </form>
          <div style={{ marginTop: "1rem", color: "var(--muted)", textAlign: "center" }}>
            No account? <a href="/signup">Sign up</a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="auth card">
        <h2>Log In</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">Email*</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@church.org"
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">Password*</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "space-between", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/reset">Forgot password?</a>
            <button 
              type="submit"
              className="btn primary" 
              disabled={loading}
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
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
        
        <div style={{ marginTop: "1rem", color: "var(--muted)", textAlign: "center" }}>
          No account? {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/signup">Sign up</a>
        </div>
      </div>
    </section>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}


