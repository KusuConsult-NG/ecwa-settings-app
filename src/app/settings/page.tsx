"use client"
import { useState, useEffect } from "react"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: ''
  })

  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
    ipRestrictions: false,
    sessionTimeoutMinutes: '30',
    loginNotifications: true,
    passwordExpiry: false,
    passwordExpiryDays: '90'
  })

  useEffect(() => {
    setMounted(true)
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/me')
      const data = await response.json()
      
      if (data.user) {
        setUser(data.user)
        setProfileData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          role: data.user.role || ''
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })
      
      if (response.ok) {
        showMessage('success', 'Profile updated successfully!')
        fetchUserData() // Refresh user data
      } else {
        showMessage('error', 'Failed to update profile')
      }
    } catch (error) {
      showMessage('error', 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      if (response.ok) {
        showMessage('success', 'Password updated successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        showMessage('error', data.error || 'Failed to update password')
      }
    } catch (error) {
      showMessage('error', 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/settings/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securitySettings)
      })
      
      if (response.ok) {
        showMessage('success', 'Security settings updated successfully!')
      } else {
        showMessage('error', 'Failed to update security settings')
      }
    } catch (error) {
      showMessage('error', 'Failed to update security settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (setting: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }))
  }

  if (!mounted) {
    return (
      <section className="container">
        <div className="section-title"><h2>Settings</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Settings</h2>
        <p>Manage your account settings, security preferences, and profile information</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`} style={{marginBottom: '1rem'}}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--line)'
      }}>
        <button
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('profile')}
          style={{borderRadius: '0', borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent'}}
        >
          👤 Profile
        </button>
        <button
          className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('password')}
          style={{borderRadius: '0', borderBottom: activeTab === 'password' ? '2px solid var(--primary)' : '2px solid transparent'}}
        >
          🔒 Password
        </button>
        <button
          className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('security')}
          style={{borderRadius: '0', borderBottom: activeTab === 'security' ? '2px solid var(--primary)' : '2px solid transparent'}}
        >
          🛡️ Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h3 style={{marginBottom: '1rem'}}>Profile Information</h3>
          <p style={{color: 'var(--muted)', marginBottom: '1.5rem'}}>Update your personal information and contact details</p>
          
          <form onSubmit={handleProfileUpdate} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                  required
                  placeholder="Enter your email address"
                />
              </div>
                </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <input
                  id="role"
                  type="text"
                  value={profileData.role}
                  onChange={(e) => setProfileData(prev => ({...prev, role: e.target.value}))}
                  placeholder="Enter your role"
                />
              </div>
                    </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({...prev, address: e.target.value}))}
                placeholder="Enter your address"
                rows={3}
              />
                    </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
                    </div>
          </form>
                  </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card">
          <h3 style={{marginBottom: '1rem'}}>Change Password</h3>
          <p style={{color: 'var(--muted)', marginBottom: '1.5rem'}}>Update your password to keep your account secure</p>
          
          <form onSubmit={handlePasswordUpdate} className="form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                required
                placeholder="Enter your current password"
              />
                        </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                  required
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                  required
                  placeholder="Confirm new password"
                  minLength={6}
                />
                      </div>
                    </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Change Password'}
              </button>
                    </div>
          </form>
                    </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card">
          <h3 style={{marginBottom: '1rem'}}>Security Settings</h3>
          <p style={{color: 'var(--muted)', marginBottom: '1.5rem'}}>Configure security policies and access controls</p>
          
          <form onSubmit={handleSecurityUpdate} className="form">
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--line)', borderRadius: 'var(--radius-input)'}}>
                <div>
                  <label style={{fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>Two-Factor Authentication</label>
                  <p style={{fontSize: '14px', color: 'var(--muted)', margin: 0}}>Require 2FA for enhanced security</p>
                </div>
                <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
                  <input 
                    type="checkbox" 
                    checked={securitySettings.twoFactorAuth}
                    onChange={() => handleToggle('twoFactorAuth')}
                    style={{opacity: 0, width: 0, height: 0}}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: securitySettings.twoFactorAuth ? 'var(--primary)' : '#ccc',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: securitySettings.twoFactorAuth ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}></span>
                  </span>
                </label>
                  </div>

              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--line)', borderRadius: 'var(--radius-input)'}}>
                <div>
                  <label style={{fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>Session Timeout</label>
                  <p style={{fontSize: '14px', color: 'var(--muted)', margin: 0}}>Auto-logout after inactivity</p>
                </div>
                <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
                  <input 
                    type="checkbox" 
                    checked={securitySettings.sessionTimeout}
                    onChange={() => handleToggle('sessionTimeout')}
                    style={{opacity: 0, width: 0, height: 0}}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: securitySettings.sessionTimeout ? 'var(--primary)' : '#ccc',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: securitySettings.sessionTimeout ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}></span>
                  </span>
                </label>
                  </div>

              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--line)', borderRadius: 'var(--radius-input)'}}>
                <div>
                  <label style={{fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>Login Notifications</label>
                  <p style={{fontSize: '14px', color: 'var(--muted)', margin: 0}}>Get notified of new login attempts</p>
                </div>
                <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
                  <input 
                    type="checkbox" 
                    checked={securitySettings.loginNotifications}
                    onChange={() => handleToggle('loginNotifications')}
                    style={{opacity: 0, width: 0, height: 0}}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: securitySettings.loginNotifications ? 'var(--primary)' : '#ccc',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: securitySettings.loginNotifications ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}></span>
                  </span>
                </label>
              </div>

              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--line)', borderRadius: 'var(--radius-input)'}}>
                <div>
                  <label style={{fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>Password Expiry</label>
                  <p style={{fontSize: '14px', color: 'var(--muted)', margin: 0}}>Require password change after specified days</p>
                </div>
                <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
                  <input 
                    type="checkbox" 
                    checked={securitySettings.passwordExpiry}
                    onChange={() => handleToggle('passwordExpiry')}
                    style={{opacity: 0, width: 0, height: 0}}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: securitySettings.passwordExpiry ? 'var(--primary)' : '#ccc',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: securitySettings.passwordExpiry ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}></span>
                  </span>
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                  <select 
                    id="sessionTimeout"
                    value={securitySettings.sessionTimeoutMinutes}
                    onChange={(e) => setSecuritySettings(prev => ({...prev, sessionTimeoutMinutes: e.target.value}))}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="passwordExpiryDays">Password Expiry (days)</label>
                  <select 
                    id="passwordExpiryDays"
                    value={securitySettings.passwordExpiryDays}
                    onChange={(e) => setSecuritySettings(prev => ({...prev, passwordExpiryDays: e.target.value}))}
                    disabled={!securitySettings.passwordExpiry}
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                  </select>
                </div>
              </div>
                </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Save Security Settings'}
              </button>
              </div>
          </form>
    </div>
      )}
    </section>
  )
}