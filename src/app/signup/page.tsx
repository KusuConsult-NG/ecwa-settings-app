"use client"
import { useState, useEffect, Suspense } from "react"

interface SignupError {
  message: string
  code?: string
  details?: string[]
}

function SignupForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<SignupError | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Password strength validation
  const validatePassword = (pwd: string) => {
    const errors: string[] = []
    if (pwd.length < 8) errors.push("At least 8 characters")
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter")
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter")
    if (!/\d/.test(pwd)) errors.push("One number")
    return { valid: errors.length === 0, errors }
  }

  const passwordValidation = validatePassword(password)
  const passwordsMatch = password === confirmPassword

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Client-side validation
    if (!name.trim()) {
      setError({ message: "Name is required", code: "MISSING_NAME" })
      setLoading(false)
      return
    }

    if (!email.trim()) {
      setError({ message: "Email is required", code: "MISSING_EMAIL" })
      setLoading(false)
      return
    }

    if (!phone.trim()) {
      setError({ message: "Phone number is required", code: "MISSING_PHONE" })
      setLoading(false)
      return
    }

    if (!address.trim()) {
      setError({ message: "Address is required", code: "MISSING_ADDRESS" })
      setLoading(false)
      return
    }

    if (!password) {
      setError({ message: "Password is required", code: "MISSING_PASSWORD" })
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError({ message: "Passwords do not match", code: "PASSWORDS_MISMATCH" })
      setLoading(false)
      return
    }

    if (!passwordValidation.valid) {
      setError({ 
        message: "Password does not meet requirements", 
        code: "WEAK_PASSWORD",
        details: passwordValidation.errors
      })
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          phone: phone.trim(),
          address: address.trim(),
          password 
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Signup failed")
      }

      window.location.href = "/dashboard"
    } catch (err: any) {
      setError({
        message: err.message || "An unexpected error occurred",
        code: "SIGNUP_FAILED"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <section className="container">
        <div className="auth card" style={{ backgroundColor: "transparent", color: "white" }}>
          <h2 style={{ color: "white" }}>Sign Up & Create Organization</h2>
          <form className="row">
            <div>
              <label htmlFor="name" style={{ color: "white" }}>Full name*</label>
              <input
                id="name"
                required
                placeholder="Your name"
                autoComplete="name"
                disabled
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
              />
            </div>
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
          <div className="row">
            <div>
              <label htmlFor="phone" style={{ color: "white" }}>Phone number*</label>
              <input
                id="phone"
                type="tel"
                required
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
                disabled
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
              />
            </div>
            <div>
              <label htmlFor="address" style={{ color: "white" }}>Address*</label>
              <input
                id="address"
                required
                placeholder="123 Church Street, City, State"
                autoComplete="street-address"
                disabled
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
              />
            </div>
          </div>
          <div className="row">
            <div>
              <label htmlFor="password" style={{ color: "white" }}>Password*</label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="new-password"
                disabled
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" style={{ color: "white" }}>Confirm password*</label>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="new-password"
                disabled
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
              />
            </div>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
            <a className="btn ghost" href="/" style={{ color: "white" }}>Cancel</a>
            <button className="btn primary" disabled>Create</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="auth card" style={{ backgroundColor: "transparent", color: "white" }}>
        <h2 style={{ color: "white" }}>Sign Up & Create Organization</h2>
        <form onSubmit={onSubmit} className="row">
          <div>
            <label htmlFor="name" style={{ color: "white" }}>Full name*</label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
              autoComplete="name"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
            />
          </div>
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
        
        <div className="row">
          <div>
            <label htmlFor="phone" style={{ color: "white" }}>Phone number*</label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={loading}
              autoComplete="tel"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
            />
          </div>
          <div>
            <label htmlFor="address" style={{ color: "white" }}>Address*</label>
            <input
              id="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Church Street, City, State"
              disabled={loading}
              autoComplete="street-address"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
            />
          </div>
        </div>
        
        <div className="row">
          <div>
            <label htmlFor="password" style={{ color: "white" }}>Password*</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
            />
            {password && !passwordValidation.valid && (
              <div style={{ fontSize: "0.75rem", color: "#FCA5A5", marginTop: "0.25rem" }}>
                Password must have: {passwordValidation.errors.join(", ")}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" style={{ color: "white" }}>Confirm password*</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}
            />
            {confirmPassword && !passwordsMatch && (
              <div style={{ fontSize: "0.75rem", color: "#FCA5A5", marginTop: "0.25rem" }}>
                Passwords do not match
              </div>
            )}
          </div>
        </div>
        
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
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn ghost" href="/" style={{ color: "white" }}>Cancel</a>
          <button 
            className="btn primary" 
            disabled={loading || !passwordValidation.valid || !passwordsMatch}
            onClick={onSubmit}
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </section>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}


