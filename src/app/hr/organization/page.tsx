"use client"
import { useState, useEffect } from "react"

const organizationHierarchy = [
  { id: "GCC001", name: "ECWA General Church Council", type: "GCC", parent: null as string | null, level: 0 },
  { id: "DCC001", name: "ECWA Jos DCC", type: "DCC", parent: "GCC001", level: 1 },
  { id: "DCC002", name: "ECWA Kaduna DCC", type: "DCC", parent: "GCC001", level: 1 },
  { id: "LCC001", name: "ECWA Jos Central LCC", type: "LCC", parent: "DCC001", level: 2 },
  { id: "LCC002", name: "ECWA Bukuru LCC", type: "LCC", parent: "DCC001", level: 2 },
  { id: "LC001", name: "ECWA GoodNews HighCost - LC", type: "LC", parent: "LCC001", level: 3 },
  { id: "LC002", name: "ECWA Faith Chapel - LC", type: "LC", parent: "LCC001", level: 3 },
]

const getOrgTypeBadge = (type: string) => {
  return <span className="badge" style={{backgroundColor: 'var(--muted)', color: 'white'}}>{type}</span>
}

export default function OrganizationSettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [orgData, setOrgData] = useState({
    name: "",
    type: "",
    address: "",
    phone: "",
    email: ""
  })
  const [isAddOrgDialogOpen, setIsAddOrgDialogOpen] = useState(false)
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    type: "",
    parentId: ""
  })

  useEffect(() => {
    setMounted(true)
    // Fetch user data
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user)
        if (data.user?.orgName) {
          setOrgData(prev => ({
            ...prev,
            name: data.user.orgName,
            type: data.user.orgId?.startsWith('DCC') ? 'DCC' : 
                  data.user.orgId?.startsWith('LCC') ? 'LCC' : 
                  data.user.orgId?.startsWith('LC') ? 'LC' : 'GCC'
          }))
        }
      })
  }, [])

  const handleSaveOrgInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: user?.orgId,
          orgName: orgData.name,
          role: user?.role
        })
      })
      if (res.ok) {
        alert('Organization information saved successfully!')
      }
    } catch (error) {
      console.error('Error saving org info:', error)
      alert('Failed to save organization information')
    }
  }

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrgData)
      })
      if (res.ok) {
        alert('Organization added successfully!')
        setIsAddOrgDialogOpen(false)
        setNewOrgData({ name: "", type: "", parentId: "" })
      }
    } catch (error) {
      console.error('Error adding organization:', error)
      alert('Failed to add organization')
    }
  }

  if (!mounted) {
    return (
      <section className="container">
        <div className="section-title"><h2>Organization Settings</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Organization Settings</h2>
        <p>Manage organization information and hierarchy</p>
      </div>

      <div className="card" style={{marginBottom: '2rem'}}>
        <h3 style={{marginBottom: '1rem'}}>Organization Information</h3>
        <p style={{marginBottom: '1rem', color: 'var(--muted)'}}>Basic information about your church organization</p>
        
        <form onSubmit={handleSaveOrgInfo} className="form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="orgName">Organization Name</label>
              <input 
                id="orgName" 
                value={orgData.name}
                onChange={(e) => setOrgData(prev => ({...prev, name: e.target.value}))}
                placeholder="Enter organization name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="orgType">Organization Type</label>
              <select 
                value={orgData.type} 
                onChange={(e) => setOrgData(prev => ({...prev, type: e.target.value}))}
              >
                <option value="gcc">General Church Council (GCC)</option>
                <option value="dcc">District Church Council (DCC)</option>
                <option value="lcc">Local Church Council (LCC)</option>
                <option value="lc">Local Church (LC)</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea 
              id="address" 
              value={orgData.address}
              onChange={(e) => setOrgData(prev => ({...prev, address: e.target.value}))}
              placeholder="Enter organization address"
              rows={3}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                id="phone" 
                value={orgData.phone}
                onChange={(e) => setOrgData(prev => ({...prev, phone: e.target.value}))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                id="email" 
                type="email" 
                value={orgData.email}
                onChange={(e) => setOrgData(prev => ({...prev, email: e.target.value}))}
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <div>
            <h3>Organization Hierarchy</h3>
            <p style={{color: 'var(--muted)', margin: '0.5rem 0 0'}}>Manage the church organizational structure</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAddOrgDialogOpen(true)}
          >
            + Add Organization
          </button>
        </div>
        
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Type</th>
                <th>Parent</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizationHierarchy.map((org) => (
                <tr key={org.id}>
                  <td style={{ 
                    paddingLeft: `${org.level * 20 + 16}px`,
                    verticalAlign: 'middle',
                    textAlign: 'left'
                  }}>
                    <strong>{org.name}</strong>
                  </td>
                  <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                    {getOrgTypeBadge(org.type)}
                  </td>
                  <td style={{ verticalAlign: 'middle', textAlign: 'left' }}>
                    {org.parent ? organizationHierarchy.find((p) => p.id === org.parent)?.name : "-"}
                  </td>
                  <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                    {org.level}
                  </td>
                  <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                    <div className="btn-group">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => alert(`Edit ${org.name} - Feature coming soon`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${org.name}?`)) {
                            alert(`Delete ${org.name} - Feature coming soon`)
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Organization Dialog */}
      {isAddOrgDialogOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-card)',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{marginBottom: '1rem'}}>Add New Organization</h3>
            <p style={{color: 'var(--muted)', marginBottom: '1.5rem'}}>Create a new organization in the hierarchy</p>
            
            <form onSubmit={handleAddOrganization} className="form">
              <div className="form-group">
                <label htmlFor="newOrgName">Organization Name</label>
                <input 
                  id="newOrgName" 
                  placeholder="Enter organization name" 
                  value={newOrgData.name}
                  onChange={(e) => setNewOrgData(prev => ({...prev, name: e.target.value}))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newOrgType">Type</label>
                <select 
                  value={newOrgData.type} 
                  onChange={(e) => setNewOrgData(prev => ({...prev, type: e.target.value}))}
                  required
                >
                  <option value="">Select type</option>
                  <option value="dcc">District Church Council (DCC)</option>
                  <option value="lcc">Local Church Council (LCC)</option>
                  <option value="lc">Local Church (LC)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="parentOrg">Parent Organization</label>
                <select 
                  value={newOrgData.parentId} 
                  onChange={(e) => setNewOrgData(prev => ({...prev, parentId: e.target.value}))}
                  required
                >
                  <option value="">Select parent</option>
                  <option value="GCC-001">ECWA General Church Council</option>
                  <option value="DCC-001">ECWA Jos DCC</option>
                  <option value="DCC-002">ECWA Kaduna DCC</option>
                  <option value="DCC-003">ECWA Abuja DCC</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsAddOrgDialogOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Organization</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
