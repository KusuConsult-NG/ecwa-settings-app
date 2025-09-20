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

type Org = { id: string; name: string; type: string; parentId?: string }

export default function CreateOrgPage(){
  const [orgType, setOrgType] = useState<string>("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [selectedDcc, setSelectedDcc] = useState("")
  const [selectedLcc, setSelectedLcc] = useState("")
  const [dccs, setDccs] = useState<Org[]>([])
  const [lccs, setLccs] = useState<Org[]>([])
  const [loading, setLoading] = useState(false)
  const [existingOrgs, setExistingOrgs] = useState<any[]>([])

  // ECWA Executive Roles for GCC
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
    fetch('/api/org?type=DCC').then(r => r.json()).then(d => setDccs(d.items || [])) 
  }, [])

  useEffect(() => { 
    if(selectedDcc) {
      fetch(`/api/org?type=LCC&parentId=${selectedDcc}`).then(r => r.json()).then(d => setLccs(d.items || []))
    } else {
      setLccs([])
    }
  }, [selectedDcc])

  useEffect(() => {
    if (orgType) {
      fetch(`/api/org?type=${orgType}`).then(r => r.json()).then(d => setExistingOrgs(d.items || []))
    }
  }, [orgType])

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setAddress("")
    setPhone("")
    setWebsite("")
    setSelectedDcc("")
    setSelectedLcc("")
    setSelectedRoles(['president', 'general-secretary', 'treasurer'])
  }

  async function createOrganization(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !orgType) return
    
    // Validate parent selection for LCC and LC
    if (orgType === 'LCC' && !selectedDcc) {
      alert('Please select a DCC for the LCC')
      return
    }
    if (orgType === 'LC' && !selectedLcc) {
      alert('Please select an LCC for the LC')
      return
    }
    
    setLoading(true)
    try {
      const body: any = {
        name, 
        type: orgType,
        email: email.trim(),
        address: address || undefined,
        phone: phone || undefined,
        website: website || undefined
      }

      // Add parent ID for LCC and LC
      if (orgType === 'LCC') {
        body.parentId = selectedDcc
      } else if (orgType === 'LC') {
        body.parentId = selectedLcc
      }

      // Add executive roles for GCC
      if (orgType === 'GCC') {
        body.executiveRoles = selectedRoles
      }

      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) { 
        const { org } = await res.json()
        resetForm()
        const list = await fetch(`/api/org?type=${orgType}`).then(r => r.json())
        setExistingOrgs(list.items || [])
        
        const roleCount = orgType === 'GCC' ? selectedRoles.length : 2
        alert(`${orgType} created successfully! ${roleCount} verification codes sent to ${email}`)
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || `Failed to create ${orgType}`}`)
      }
    } catch (error) {
      console.error(`Error creating ${orgType}:`, error)
      alert(`Failed to create ${orgType}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const getOrgTypeInfo = () => {
    switch (orgType) {
      case 'GCC':
        return {
          title: 'Global Coordinating Council (GCC)',
          description: 'Set up the highest level of ECWA organization with executive leadership roles',
          icon: '🌍',
          placeholder: 'ECWA Global Headquarters'
        }
      case 'DCC':
        return {
          title: 'District Coordinating Council (DCC)',
          description: 'Create a district-level organization under the GCC',
          icon: '🏢',
          placeholder: 'ECWA Jos DCC'
        }
      case 'LCC':
        return {
          title: 'Local Coordinating Council (LCC)',
          description: 'Create a local council under a DCC',
          icon: '🏛️',
          placeholder: 'ECWA Jos Central LCC'
        }
      case 'LC':
        return {
          title: 'Local Church (LC)',
          description: 'Create a local church under an LCC',
          icon: '🏢',
          placeholder: 'ECWA • LC – Example Name'
        }
      default:
        return {
          title: 'Create Organization',
          description: 'Select an organization type to get started',
          icon: '🏢',
          placeholder: 'Organization Name'
        }
    }
  }

  const orgInfo = getOrgTypeInfo()

  return (
    <section className="container">
      <div className="section-title">
        <h2>Create Organization</h2>
        <p className="muted">Set up new ECWA organizations with proper hierarchy and leadership structure</p>
      </div>
      
      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={createOrganization}>
          {/* Organization Type Selection */}
          <div className="form-section">
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '1.1rem' }}>Organization Type</h3>
            <div className="row">
              <div>
                <label>Organization Level *</label>
                <select 
                  value={orgType} 
                  onChange={(e) => {
                    setOrgType(e.target.value)
                    resetForm()
                  }}
                  required
                  disabled={loading}
                >
                  <option value="">Select Organization Type</option>
                  <option value="GCC">🌍 Global Coordinating Council (GCC)</option>
                  <option value="DCC">🏢 District Coordinating Council (DCC)</option>
                  <option value="LCC">🏛️ Local Coordinating Council (LCC)</option>
                  <option value="LC">🏢 Local Church (LC)</option>
                </select>
              </div>
              <div></div>
            </div>
          </div>

          {orgType && (
            <>
              {/* Basic Information */}
              <div className="form-section">
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '1.1rem' }}>
                  {orgInfo.icon} {orgInfo.title}
                </h3>
                <p className="muted" style={{ marginBottom: '1rem' }}>{orgInfo.description}</p>
                
                <div className="row">
                  <div>
                    <label>Organization Name *</label>
                    <input 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder={orgInfo.placeholder}
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
                      placeholder={`admin@ecwa-${orgType.toLowerCase()}-name.org`}
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
                      placeholder="123 Church Street, City, State"
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
                      placeholder={`https://ecwa-${orgType.toLowerCase()}-name.org`}
                      disabled={loading}
                    />
                  </div>
                  <div></div>
                </div>
              </div>

              {/* Parent Organization Selection for LCC and LC */}
              {(orgType === 'LCC' || orgType === 'LC') && (
                <div className="form-section">
                  <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '1.1rem' }}>Parent Organization</h3>
                  
                  {orgType === 'LCC' && (
                    <div className="row">
                      <div>
                        <label>DCC *</label>
                        <select 
                          value={selectedDcc} 
                          onChange={(e) => {
                            setSelectedDcc(e.target.value)
                            setSelectedLcc("")
                          }}
                          required
                          disabled={loading}
                        >
                          <option value="">Select DCC</option>
                          {dccs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div></div>
                    </div>
                  )}

                  {orgType === 'LC' && (
                    <div className="row">
                      <div>
                        <label>DCC *</label>
                        <select 
                          value={selectedDcc} 
                          onChange={(e) => {
                            setSelectedDcc(e.target.value)
                            setSelectedLcc("")
                          }}
                          required
                          disabled={loading}
                        >
                          <option value="">Select DCC</option>
                          {dccs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label>LCC *</label>
                        <select 
                          value={selectedLcc} 
                          onChange={(e) => setSelectedLcc(e.target.value)} 
                          disabled={!selectedDcc || loading}
                          required
                        >
                          <option value="">Select LCC</option>
                          {lccs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Executive Roles Selection for GCC */}
              {orgType === 'GCC' && (
                <div className="form-section">
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
              )}

              {/* Submit Button */}
              <div className="form-actions">
                <button 
                  type="submit"
                  className="btn primary" 
                  disabled={loading || !name || !email || (orgType === 'LCC' && !selectedDcc) || (orgType === 'LC' && !selectedLcc) || (orgType === 'GCC' && selectedRoles.length === 0)}
                  style={{ minWidth: '200px' }}
                >
                  {loading ? `Creating ${orgType}...` : `Create ${orgType}`}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Existing Organizations */}
        {existingOrgs.length > 0 && (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text)' }}>Existing {orgType}s:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {existingOrgs.map(org => (
                <div key={org.id} className="badge" style={{ padding: '0.5rem 1rem' }}>
                  {org.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
