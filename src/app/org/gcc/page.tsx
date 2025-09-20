"use client"
import { useEffect, useState } from "react"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

type ExecutiveRole = {
  id: string
  title: string
  description: string
  level: 'GCC' | 'DCC' | 'LCC' | 'LC'
  isRequired: boolean
}

export default function CreateGccPage(){
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)
  const [gccs, setGccs] = useState<any[]>([])

  // ECWA Executive Roles
  const executiveRoles: ExecutiveRole[] = [
    { id: 'president', title: 'President', description: 'Overall leadership and spiritual oversight', level: 'GCC', isRequired: true },
    { id: 'vice-president', title: 'Vice President', description: 'Assists the President in leadership duties', level: 'GCC', isRequired: false },
    { id: 'general-secretary', title: 'General Secretary', description: 'Administrative head and record keeping', level: 'GCC', isRequired: true },
    { id: 'assistant-secretary', title: 'Assistant Secretary', description: 'Supports the General Secretary', level: 'GCC', isRequired: false },
    { id: 'treasurer', title: 'Treasurer', description: 'Financial management and oversight', level: 'GCC', isRequired: true },
    { id: 'assistant-treasurer', title: 'Assistant Treasurer', description: 'Supports the Treasurer', level: 'GCC', isRequired: false },
    { id: 'evangelism-secretary', title: 'Evangelism Secretary', description: 'Oversees evangelism and missions', level: 'GCC', isRequired: false },
    { id: 'youth-secretary', title: 'Youth Secretary', description: 'Youth ministry coordination', level: 'GCC', isRequired: false },
    { id: 'women-secretary', title: 'Women Secretary', description: 'Women ministry coordination', level: 'GCC', isRequired: false },
    { id: 'men-secretary', title: 'Men Secretary', description: 'Men ministry coordination', level: 'GCC', isRequired: false },
    { id: 'children-secretary', title: 'Children Secretary', description: 'Children ministry coordination', level: 'GCC', isRequired: false },
    { id: 'education-secretary', title: 'Education Secretary', description: 'Educational programs oversight', level: 'GCC', isRequired: false },
    { id: 'social-secretary', title: 'Social Secretary', description: 'Social welfare and community programs', level: 'GCC', isRequired: false },
    { id: 'legal-advisor', title: 'Legal Advisor', description: 'Legal counsel and compliance', level: 'GCC', isRequired: false },
    { id: 'auditor', title: 'Auditor', description: 'Financial auditing and oversight', level: 'GCC', isRequired: false }
  ]

  const [selectedRoles, setSelectedRoles] = useState<string[]>(['president', 'general-secretary', 'treasurer'])

  useEffect(() => { 
    fetch('/api/org?type=GCC').then(r => r.json()).then(d => setGccs(d.items || [])) 
  }, [])

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  async function createGCC(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, 
          type: 'GCC',
          email: email.trim(),
          address: address || undefined,
          phone: phone || undefined,
          website: website || undefined,
          executiveRoles: selectedRoles
        })
      })
      
      if (res.ok) { 
        const { org } = await res.json()
        setName("")
        setEmail("")
        setAddress("")
        setPhone("")
        setWebsite("")
        setSelectedRoles(['president', 'general-secretary', 'treasurer'])
        const list = await fetch('/api/org?type=GCC').then(r => r.json())
        setGccs(list.items || [])
        alert(`GCC created successfully! Verification codes sent to all executive emails.`)
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to create GCC'}`)
      }
    } catch (error) {
      console.error('Error creating GCC:', error)
      alert('Failed to create GCC. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Create Global Coordinating Council (GCC)</h2>
        <p className="muted">Set up the highest level of ECWA organization with executive leadership roles</p>
      </div>
      
      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={createGCC}>
          {/* Basic Information */}
          <div className="form-section">
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '1.1rem' }}>Organization Details</h3>
            <div className="row">
              <div>
                <label>GCC Name *</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="ECWA Global Headquarters"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label>Contact Email *</label>
                <input 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="admin@ecwa-global.org"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Address</label>
                <input 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="123 Global Street, Lagos, Nigeria"
                  disabled={loading}
                />
              </div>
              <div>
                <label>Phone</label>
                <input 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="+234 803 123 4567"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Website</label>
                <input 
                  value={website} 
                  onChange={e => setWebsite(e.target.value)} 
                  placeholder="https://ecwa-global.org"
                  disabled={loading}
                />
              </div>
              <div></div>
            </div>
          </div>

          {/* Executive Roles Selection */}
          <div className="form-section" style={{ marginTop: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '1.1rem' }}>Executive Leadership Roles</h3>
            <p className="muted" style={{ marginBottom: '1rem' }}>Select the executive positions for this GCC. Required roles are pre-selected.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {executiveRoles.map(role => (
                <div 
                  key={role.id}
                  className={`role-card ${selectedRoles.includes(role.id) ? 'selected' : ''} ${role.isRequired ? 'required' : ''}`}
                  onClick={() => !role.isRequired && handleRoleToggle(role.id)}
                  style={{
                    padding: '1rem',
                    border: '2px solid var(--line)',
                    borderRadius: '8px',
                    cursor: role.isRequired ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedRoles.includes(role.id) ? 'rgba(14, 77, 164, 0.05)' : '#fff',
                    borderColor: selectedRoles.includes(role.id) ? 'var(--primary)' : 'var(--line)',
                    opacity: role.isRequired ? 1 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => !role.isRequired && handleRoleToggle(role.id)}
                      disabled={role.isRequired || loading}
                      style={{ margin: 0 }}
                    />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text)' }}>
                      {role.title}
                      {role.isRequired && <span style={{ color: 'var(--danger)', marginLeft: '0.5rem' }}>*</span>}
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--muted)' }}>
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="submit"
              className="btn primary" 
              disabled={loading || !name || !email || selectedRoles.length === 0}
              style={{ minWidth: '200px' }}
            >
              {loading ? 'Creating GCC...' : 'Create GCC'}
            </button>
          </div>
        </form>

        {/* Existing GCCs */}
        {gccs.length > 0 && (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text)' }}>Existing GCCs:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {gccs.map(gcc => (
                <div key={gcc.id} className="badge" style={{ padding: '0.5rem 1rem' }}>
                  {gcc.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
