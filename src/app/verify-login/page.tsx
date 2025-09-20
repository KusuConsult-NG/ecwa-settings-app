"use client";

import { useState, useEffect, Suspense } from "react";
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
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedDcc, setSelectedDcc] = useState("");
  const [selectedLcc, setSelectedLcc] = useState("");
  const [selectedLc, setSelectedLc] = useState("");
  const [dccs, setDccs] = useState<any[]>([]);
  const [lccs, setLccs] = useState<any[]>([]);
  const [lcs, setLcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [step, setStep] = useState<'verify' | 'profile'>('verify');
  const [user, setUser] = useState<any>(null);
  const searchParams = useSearchParams();

  // Check for redirect parameter
  const redirect = searchParams?.get("next") || "/dashboard";

  // Load organizations when profile step is reached
  useEffect(() => {
    if (step === 'profile') {
      // Load DCCs
      fetch('/api/org?type=DCC')
        .then(r => r.json())
        .then(data => setDccs(data.items || []))
        .catch(err => console.error('Failed to load DCCs:', err));
    }
  }, [step]);

  // Load LCCs when DCC is selected
  useEffect(() => {
    if (selectedDcc) {
      fetch(`/api/org?type=LCC&parentId=${selectedDcc}`)
        .then(r => r.json())
        .then(data => setLccs(data.items || []))
        .catch(err => console.error('Failed to load LCCs:', err));
    } else {
      setLccs([]);
      setSelectedLcc("");
    }
  }, [selectedDcc]);

  // Load LCs when LCC is selected
  useEffect(() => {
    if (selectedLcc) {
      fetch(`/api/org?type=LC&parentId=${selectedLcc}`)
        .then(r => r.json())
        .then(data => setLcs(data.items || []))
        .catch(err => console.error('Failed to load LCs:', err));
    } else {
      setLcs([]);
      setSelectedLc("");
    }
  }, [selectedLcc]);

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
      
      // Check if this is first login (needs profile setup)
      if (data.user.isFirstLogin) {
        setStep('profile');
        // Pre-populate with existing data if available
        setFirstName(data.user.firstName || '');
        setSurname(data.user.surname || '');
        setPhone(data.user.phone || '');
        setAddress(data.user.address || '');
        console.log("First login - profile setup required");
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

  async function handleProfileSetup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!firstName.trim()) {
      setError({ message: "First name is required", code: "MISSING_FIRST_NAME" });
      setLoading(false);
      return;
    }

    if (!surname.trim()) {
      setError({ message: "Surname is required", code: "MISSING_SURNAME" });
      setLoading(false);
      return;
    }

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
      console.log("Frontend: Setting up profile and password");
      const res = await fetch("/api/auth/verify-login", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          password,
          firstName: firstName.trim(),
          surname: surname.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          dccId: selectedDcc || undefined,
          lccId: selectedLcc || undefined,
          lcId: selectedLc || undefined
        })
      });
      
      console.log("Frontend: Profile setup response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log("Frontend: Profile setup failed with error text:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || "Profile setup failed" };
        }
        throw new Error(errorData.error || "Profile setup failed");
      }
      
      const data = await res.json();
      console.log("Frontend: Profile setup response data:", data);

      // Profile setup successful - redirect to dashboard
      console.log("Profile setup successful, redirecting to:", redirect);
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      setTimeout(() => {
        window.location.replace(redirect);
      }, 1000);
    } catch (err: any) {
      console.log("Frontend: Profile setup error caught:", err);
      setError({
        message: err.message || "An unexpected error occurred",
        code: "PROFILE_SETUP_FAILED"
      });
    } finally {
      setLoading(false);
    }
  }

  if (step === 'profile') {
    return (
      <section className="container">
        <div className="auth card">
          <h2>Complete Your Profile</h2>
          <p>Welcome, {user?.name}! Please complete your profile information and set up your password.</p>
          
          <form onSubmit={handleProfileSetup}>
            {/* Personal Information Section */}
            <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--line)" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--primary)", fontSize: "1.1rem" }}>Personal Information</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="surname">Surname *</label>
                  <input
                    id="surname"
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Enter your surname"
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Church Street, City, State"
                    disabled={loading}
                    autoComplete="street-address"
                  />
                </div>
              </div>

              {/* Organization Selection */}
              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ margin: "0 0 0.75rem 0", color: "var(--text)", fontSize: "1rem", fontWeight: "600" }}>Organization Affiliation</h4>
                <p style={{ margin: "0 0 1rem 0", color: "var(--muted)", fontSize: "0.875rem" }}>
                  Select the organizations you are affiliated with (optional)
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label htmlFor="selectedDcc">DCC (District)</label>
                    <select
                      id="selectedDcc"
                      value={selectedDcc}
                      onChange={(e) => {
                        setSelectedDcc(e.target.value);
                        setSelectedLcc("");
                        setSelectedLc("");
                      }}
                      disabled={loading}
                    >
                      <option value="">Select DCC</option>
                      {dccs.map(dcc => (
                        <option key={dcc.id} value={dcc.id}>{dcc.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="selectedLcc">LCC (Local Council)</label>
                    <select
                      id="selectedLcc"
                      value={selectedLcc}
                      onChange={(e) => {
                        setSelectedLcc(e.target.value);
                        setSelectedLc("");
                      }}
                      disabled={!selectedDcc || loading}
                    >
                      <option value="">Select LCC</option>
                      {lccs.map(lcc => (
                        <option key={lcc.id} value={lcc.id}>{lcc.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="selectedLc">LC (Local Church)</label>
                    <select
                      id="selectedLc"
                      value={selectedLc}
                      onChange={(e) => setSelectedLc(e.target.value)}
                      disabled={!selectedLcc || loading}
                    >
                      <option value="">Select LC</option>
                      {lcs.map(lc => (
                        <option key={lc.id} value={lc.id}>{lc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--primary)", fontSize: "1.1rem" }}>Security</h3>
              
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
                {loading ? "Completing Setup..." : "Complete Profile Setup"}
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
