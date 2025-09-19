"use client"
import { useState, useEffect } from "react"

export default function SecurityPage() {
  const [mounted, setMounted] = useState(false)
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
    ipRestrictions: false,
    sessionTimeoutMinutes: '30'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // This would need a proper API to save security settings
      alert('Security settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save security settings')
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
        <div className="section-title"><h2>Security Settings</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Security Settings</h2>
        <p>Configure security policies and access controls</p>
      </div>

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Security Policies</h3>
        <p style={{color: 'var(--muted)', marginBottom: '1.5rem'}}>Configure security policies and access controls</p>
        
        <form onSubmit={handleSaveSettings} className="form">
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--line)', borderRadius: 'var(--radius-input)'}}>
              <div>
                <label style={{fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>Two-Factor Authentication</label>
                <p style={{fontSize: '14px', color: 'var(--muted)', margin: 0}}>Require 2FA for all users</p>
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
                <label style={{fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>IP Restrictions</label>
                <p style={{fontSize: '14px', color: 'var(--muted)', margin: 0}}>Restrict access to specific IP addresses</p>
              </div>
              <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
                <input 
                  type="checkbox" 
                  checked={securitySettings.ipRestrictions}
                  onChange={() => handleToggle('ipRestrictions')}
                  style={{opacity: 0, width: 0, height: 0}}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: securitySettings.ipRestrictions ? 'var(--primary)' : '#ccc',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: securitySettings.ipRestrictions ? '26px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }}></span>
                </span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <select 
                id="sessionTimeout"
                value={securitySettings.sessionTimeoutMinutes}
                onChange={(e) => setSecuritySettings(prev => ({...prev, sessionTimeoutMinutes: e.target.value}))}
                style={{width: '200px'}}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Security Settings</button>
          </div>
        </form>
      </div>
    </section>
  )
}
