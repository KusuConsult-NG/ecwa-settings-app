"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface ResetPasswordError {
  message: string
  code?: string
  details?: string[]
}

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ResetPasswordError | null>(null)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    const tokenParam = searchParams?.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError({ message: "Invalid or missing reset token", code: "INVALID_TOKEN" })
    }
  }, [searchParams])

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

    if (!token) {
      setError({ message: "Invalid or missing reset token", code: "INVALID_TOKEN" })
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Password reset failed")
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
        <div className="auth card">
          <h2>Reset Password</h2>
          <form className="row">
            <div>
              <label htmlFor="password">New Password*</label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="new-password"
                disabled
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password*</label>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="new-password"
                disabled
              />
            </div>
          </form>
          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
            <a className="btn ghost" href="/login">Back to Login</a>
            <button className="btn primary" disabled>Reset Password</button>
          </div>
        </div>
      </section>
    )
  }

  if (success) {
    return (
      <section className="container">
        <div className="auth card">
          <h2>Password Reset Successfully</h2>
          <div style={{ color: "#059669", marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "0.375rem" }}>
            <div style={{ fontWeight: "500" }}>Your password has been updated</div>
            <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
              You can now log in with your new password.
            </div>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
            <a className="btn primary" href="/login">Go to Login</a>
          </div>
        </div>
      </section>
    )
  }

  if (!token) {
    return (
      <section className="container">
        <div className="auth card">
          <h2>Invalid Reset Link</h2>
          <div style={{ color: "#DC2626", marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "0.375rem" }}>
            <div style={{ fontWeight: "500" }}>This reset link is invalid or has expired</div>
            <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Please request a new password reset link.
            </div>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
            <a className="btn ghost" href="/reset">Request New Link</a>
            <a className="btn primary" href="/login">Back to Login</a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="auth card">
        <h2>Reset Password</h2>
        <p style={{ color: "rgba(255, 255, 255, 0.7)", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Enter your new password below.
        </p>
        <form onSubmit={onSubmit} className="row">
          <div>
            <label htmlFor="password">New Password*</label>
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
              <div style={{ fontSize: "0.75rem", color: "#DC2626", marginTop: "0.25rem" }}>
                Password must have: {passwordValidation.errors.join(", ")}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm Password*</label>
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
              <div style={{ fontSize: "0.75rem", color: "#DC2626", marginTop: "0.25rem" }}>
                Passwords do not match
              </div>
            )}
          </div>
        </form>
        
        {error && (
          <div style={{ color: "#DC2626", marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "0.375rem" }}>
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
          <a className="btn ghost" href="/login">Back to Login</a>
          <button 
            className="btn primary" 
            disabled={loading || !passwordValidation.valid || !passwordsMatch}
            onClick={onSubmit}
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </div>
      </div>
    </section>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
