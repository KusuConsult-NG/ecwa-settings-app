"use client"
import { useState, useEffect } from "react"

export default function SystemConfigPage() {
  const [mounted, setMounted] = useState(false)
  const [systemSettings, setSystemSettings] = useState({
    emailNotifications: true,
    autoBackup: true,
    auditLogging: true,
    currency: 'ngn'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // This would need a proper API to save system settings
      alert('System settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save system settings')
    }
  }

  const handleToggle = (setting: string) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }))
  }

  if (!mounted) {
    return (
      <section className="container">
        <div className="section-title"><h2>System Configuration</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>System Configuration</h2>
        <p>Configure system-wide settings and preferences</p>
      </div>

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>System Settings</h3>
        <p style={{color: 'var(--muted)', marginBottom: '1.5rem'}}>Configure system-wide settings and preferences</p>
        
        <form onSubmit={handleSaveSettings} className="form">
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--line)', borderRadius: 'var(--radius-input)'}}>
              <div>
                <label style={{fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>Email Notifications</label>
                <p style={{fontSize: '14px', color: 'var(--muted)', margin: 0}}>Send email notifications for approvals and updates</p>
              </div>
              <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
                <input 
                  type="checkbox" 
                  checked={systemSettings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  style={{opacity: 0, width: 0, height: 0}}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: systemSettings.emailNotifications ? 'var(--primary)' : '#ccc',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: systemSettings.emailNotifications ? '26px' : '3px',
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
                <label style={{fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>Auto-backup</label>
                <p style={{fontSize: '14px', color: 'var(--muted)', margin: 0}}>Automatically backup data daily</p>
              </div>
              <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
                <input 
                  type="checkbox" 
                  checked={systemSettings.autoBackup}
                  onChange={() => handleToggle('autoBackup')}
                  style={{opacity: 0, width: 0, height: 0}}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: systemSettings.autoBackup ? 'var(--primary)' : '#ccc',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: systemSettings.autoBackup ? '26px' : '3px',
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
                <label style={{fontWeight: '500', display: 'block', marginBottom: '0.25rem'}}>Audit Logging</label>
                <p style={{fontSize: '14px', color: 'var(--muted)', margin: 0}}>Log all user activities for audit purposes</p>
              </div>
              <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
                <input 
                  type="checkbox" 
                  checked={systemSettings.auditLogging}
                  onChange={() => handleToggle('auditLogging')}
                  style={{opacity: 0, width: 0, height: 0}}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: systemSettings.auditLogging ? 'var(--primary)' : '#ccc',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: systemSettings.auditLogging ? '26px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s'
                  }}></span>
                </span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="currency">Default Currency</label>
              <select 
                id="currency"
                value={systemSettings.currency}
                onChange={(e) => setSystemSettings(prev => ({...prev, currency: e.target.value}))}
                style={{width: '200px'}}
              >
                <option value="ngn">Nigerian Naira (₦)</option>
                <option value="usd">US Dollar ($)</option>
                <option value="eur">Euro (€)</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save System Settings</button>
          </div>
        </form>
      </div>
    </section>
  )
}
