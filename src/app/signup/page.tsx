"use client"
import { useState, Suspense } from "react"

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
      
      if (!res.ok) {
        const errorText = await res.text()
        console.log("Frontend: Signup failed with error text:", errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || "Signup failed" }
        }
        throw new Error(errorData.error || "Signup failed")
      }
      
      const data = await res.json()

      console.log("Signup successful, user data:", data.user)
      console.log("Redirecting to dashboard in 1000ms...")

      // Dispatch a custom event to notify other components of successful signup
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }))

      // Redirect to dashboard after successful signup (user is already authenticated)
      setTimeout(() => {
        console.log("Redirecting to dashboard now...")
        window.location.replace("/dashboard")
      }, 1000)
    } catch (err: any) {
      setError({
        message: err.message || "An unexpected error occurred",
        code: "SIGNUP_FAILED"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="auth card">
        <h2>Sign Up & Create Organization</h2>
        <form onSubmit={onSubmit}>
          <div className="row">
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="name">Full name*</label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
                autoComplete="name"
              />
            </div>
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
          </div>
          
          <div className="row">
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="phone">Phone number*</label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
                autoComplete="tel"
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="address">Address*</label>
              <input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Church Street, City, State"
                disabled={loading}
                autoComplete="street-address"
              />
            </div>
          </div>
          
          <div className="row">
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
                autoComplete="new-password"
              />
              {password && !passwordValidation.valid && (
                <div style={{ fontSize: "0.75rem", color: "#FCA5A5", marginTop: "0.25rem" }}>
                  Password must have: {passwordValidation.errors.join(", ")}
                </div>
              )}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="confirmPassword">Confirm password*</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
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
            <a className="btn ghost" href="/">Cancel</a>
            <button 
              type="submit"
              className="btn primary" 
              disabled={loading || !passwordValidation.valid || !passwordsMatch}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
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