"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface LoginError {
  message: string;
  code?: string;
}

function VerifyLoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [step, setStep] = useState<'verify' | 'password'>('verify');
  const [user, setUser] = useState<any>(null);
  const searchParams = useSearchParams();

  // Check for redirect parameter
  const redirect = searchParams?.get("next") || "/dashboard";

  async function handleVerifyLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!email.trim()) {
      setError({ message: "Email is required", code: "MISSING_EMAIL" });
      setLoading(false);
      return;
    }

    if (!code.trim()) {
      setError({ message: "Verification code is required", code: "MISSING_CODE" });
      setLoading(false);
      return;
    }

    try {
      console.log("Frontend: Attempting verification login for:", email.trim());
      const res = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      });
      
      console.log("Frontend: Verification response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log("Frontend: Verification failed with error text:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || "Verification failed" };
        }
        throw new Error(errorData.error || "Verification failed");
      }
      
      const data = await res.json();
      console.log("Frontend: Verification response data:", data);

      setUser(data.user);
      
      // Check if this is first login (needs password setup)
      if (data.user.isFirstLogin) {
        setStep('password');
        console.log("First login - password setup required");
      } else {
        // Regular login - redirect to dashboard
        console.log("Login successful, redirecting to:", redirect);
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));
        setTimeout(() => {
          window.location.replace(redirect);
        }, 1000);
      }
    } catch (err: any) {
      console.log("Frontend: Verification error caught:", err);
      setError({
        message: err.message || "An unexpected error occurred",
        code: "VERIFICATION_FAILED"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSetup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!password) {
      setError({ message: "Password is required", code: "MISSING_PASSWORD" });
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError({ message: "Password must be at least 8 characters long", code: "WEAK_PASSWORD" });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError({ message: "Passwords do not match", code: "PASSWORD_MISMATCH" });
      setLoading(false);
      return;
    }

    try {
      console.log("Frontend: Setting up password");
      const res = await fetch("/api/auth/verify-login", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      
      console.log("Frontend: Password setup response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log("Frontend: Password setup failed with error text:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || "Password setup failed" };
        }
        throw new Error(errorData.error || "Password setup failed");
      }
      
      const data = await res.json();
      console.log("Frontend: Password setup response data:", data);

      // Password setup successful - redirect to dashboard
      console.log("Password setup successful, redirecting to:", redirect);
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      setTimeout(() => {
        window.location.replace(redirect);
      }, 1000);
    } catch (err: any) {
      console.log("Frontend: Password setup error caught:", err);
      setError({
        message: err.message || "An unexpected error occurred",
        code: "PASSWORD_SETUP_FAILED"
      });
    } finally {
      setLoading(false);
    }
  }

  if (step === 'password') {
    return (
      <section className="container">
        <div className="auth card">
          <h2>Complete Your Profile</h2>
          <p>Welcome, {user?.name}! Please set up your password to complete your profile.</p>
          
          <form onSubmit={handlePasswordSetup}>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="password">New Password *</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
              />
              <small>Password must be at least 8 characters long</small>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            
            <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "space-between", alignItems: "center" }}>
              <button 
                type="button"
                className="btn secondary"
                onClick={() => setStep('verify')}
                disabled={loading}
              >
                Back
              </button>
              <button 
                type="submit"
                className="btn primary" 
                disabled={loading}
              >
                {loading ? "Setting up..." : "Complete Setup"}
              </button>
            </div>
          </form>
          
          {error && (
            <div style={{ color: "#FCA5A5", marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: "0.375rem" }}>
              <div style={{ fontWeight: "500" }}>{error.message}</div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="auth card">
        <h2>Leader Verification Login</h2>
        <p>Enter your email and verification code to access your dashboard</p>
        
        <form onSubmit={handleVerifyLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={loading}
              autoComplete="email"
            />
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="code">Verification Code *</label>
            <input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit verification code"
              disabled={loading}
              maxLength={6}
              pattern="[0-9]{6}"
            />
            <small>Check your email for the verification code</small>
          </div>
          
          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", justifyContent: "space-between", alignItems: "center" }}>
            <a href="/login" className="btn secondary">Regular Login</a>
            <button 
              type="submit"
              className="btn primary" 
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </div>
        </form>
        
        {error && (
          <div style={{ color: "#FCA5A5", marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: "0.375rem" }}>
            <div style={{ fontWeight: "500" }}>{error.message}</div>
          </div>
        )}
        
        <div style={{ marginTop: "1rem", color: "var(--muted)", textAlign: "center" }}>
          <p><strong>Don't have a verification code?</strong></p>
          <p>Contact your organization administrator to be added as a leader.</p>
        </div>
      </div>
    </section>
  );
}

export default function VerifyLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyLoginForm />
    </Suspense>
  );
}
