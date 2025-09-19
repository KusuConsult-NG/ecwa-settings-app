"use client"
import { useState, useEffect } from "react"

interface LCRecord {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  establishedDate: string;
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  type: 'urban' | 'rural' | 'suburban';
  capacity: number;
  currentMembers: number;
  pastor: {
    name: string;
    email: string;
    phone: string;
  };
  leadership: {
    chairman: string;
    secretary: string;
    treasurer: string;
    youthLeader: string;
    womenLeader: string;
    menLeader: string;
  };
  parentLCC?: string;
  parentLCCName?: string;
  childOrganizations: string[];
  facilities: string[];
  services: string[];
  createdAt: string;
  updatedAt: string;
}

export default function LCPage() {
  const [lcRecords, setLcRecords] = useState<LCRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    phone: '',
    email: '',
    website: '',
    establishedDate: '',
    type: 'urban' as 'urban' | 'rural' | 'suburban',
    capacity: 100,
    currentMembers: 0,
    pastor: {
      name: '',
      email: '',
      phone: ''
    },
    leadership: {
      chairman: '',
      secretary: '',
      treasurer: '',
      youthLeader: '',
      womenLeader: '',
      menLeader: ''
    },
    parentLCC: '',
    facilities: [] as string[],
    services: [] as string[]
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    state: '',
    city: '',
    search: ''
  })

  const types = [
    { value: 'urban', label: 'Urban', color: 'var(--primary)' },
    { value: 'rural', label: 'Rural', color: 'var(--success)' },
    { value: 'suburban', label: 'Suburban', color: 'var(--info)' }
  ]

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'closed', label: 'Closed' }
  ]

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.type) params.append('type', filters.type)
      if (filters.state) params.append('state', filters.state)
      if (filters.city) params.append('city', filters.city)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/lc?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setLcRecords(data.lcRecords || [])
      } else {
        setError(data.error || 'Failed to fetch LC data')
      }
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/lc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        await fetchData()
        setFormData({
          name: '',
          code: '',
          address: '',
          city: '',
          state: '',
          country: 'Nigeria',
          phone: '',
          email: '',
          website: '',
          establishedDate: '',
          type: 'urban',
          capacity: 100,
          currentMembers: 0,
          pastor: {
            name: '',
            email: '',
            phone: ''
          },
          leadership: {
            chairman: '',
            secretary: '',
            treasurer: '',
            youthLeader: '',
            womenLeader: '',
            menLeader: ''
          },
          parentLCC: '',
          facilities: [],
          services: []
        })
        setShowForm(false)
        setEditingId(null)
      } else {
        setError(data.error || 'Failed to save LC record')
      }
    } catch (error) {
      setError('Failed to save LC record')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'active' | 'inactive' | 'suspended' | 'closed') => {
    try {
      const response = await fetch(`/api/lc/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (response.ok) {
        await fetchData()
      } else {
        setError(data.error || 'Failed to update LC status')
      }
    } catch (error) {
      setError('Failed to update LC status')
    }
  }

  const handleMembersUpdate = async (id: string, currentMembers: number) => {
    try {
      const response = await fetch(`/api/lc/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentMembers })
      })

      const data = await response.json()

      if (response.ok) {
        await fetchData()
      } else {
        setError(data.error || 'Failed to update member count')
      }
    } catch (error) {
      setError('Failed to update member count')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success)'
      case 'inactive': return 'var(--muted)'
      case 'suspended': return 'var(--warning)'
      case 'closed': return 'var(--danger)'
      default: return 'var(--muted)'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urban': return 'var(--primary)'
      case 'rural': return 'var(--success)'
      case 'suburban': return 'var(--info)'
      default: return 'var(--muted)'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateUtilization = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading LC data...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>LC Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add LC'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <h3>Filters</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              {types.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>State</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            >
              <option value="">All States</option>
              {nigerianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="Filter by city..."
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by name, code, address, or pastor..."
            />
          </div>
        </div>
      </div>

      {/* LC Form */}
      {showForm && (
        <div className="card">
          <h2>{editingId ? 'Edit LC' : 'Add New LC'}</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>LC Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., ECWA LC Jos Central"
                  required
                />
              </div>
              <div className="form-group">
                <label>LC Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., JOS001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                >
                  {types.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                  required
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                >
                  <option value="">Select State</option>
                  {nigerianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234-xxx-xxx-xxxx"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="lc@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Established Date *</label>
                <input
                  type="date"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Members</label>
                <input
                  type="number"
                  value={formData.currentMembers}
                  onChange={(e) => setFormData({ ...formData, currentMembers: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Pastor Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Pastor Name *</label>
                  <input
                    type="text"
                    value={formData.pastor.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      pastor: { ...formData.pastor, name: e.target.value }
                    })}
                    placeholder="Rev. John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pastor Email *</label>
                  <input
                    type="email"
                    value={formData.pastor.email}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      pastor: { ...formData.pastor, email: e.target.value }
                    })}
                    placeholder="pastor@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pastor Phone *</label>
                  <input
                    type="tel"
                    value={formData.pastor.phone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      pastor: { ...formData.pastor, phone: e.target.value }
                    })}
                    placeholder="+234-xxx-xxx-xxxx"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LC Records */}
      <div className="card">
        <h2>LC Records ({lcRecords.length})</h2>
        {lcRecords.length === 0 ? (
          <div className="empty-state">
            <p>No LC records found. Add a new LC to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>LC Name</th>
                  <th>Code</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Pastor</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lcRecords.map(lc => (
                  <tr key={lc.id}>
                    <td>
                      <div>
                        <strong>{lc.name}</strong>
                        <br />
                        <small>{lc.email}</small>
                      </div>
                    </td>
                    <td>
                      <code>{lc.code}</code>
                    </td>
                    <td>
                      <div>
                        {lc.address}
                        <br />
                        <small>{lc.city}, {lc.state}</small>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ backgroundColor: getTypeColor(lc.type) }}
                      >
                        {types.find(t => t.value === lc.type)?.label}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{lc.pastor.name}</strong>
                        <br />
                        <small>{lc.pastor.phone}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{lc.currentMembers}/{lc.capacity}</strong>
                        <br />
                        <small>{calculateUtilization(lc.currentMembers, lc.capacity)}% utilized</small>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ backgroundColor: getStatusColor(lc.status) }}
                      >
                        {lc.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            const newCount = prompt(`Update member count for ${lc.name}:`, lc.currentMembers.toString())
                            if (newCount && !isNaN(Number(newCount))) {
                              handleMembersUpdate(lc.id, Number(newCount))
                            }
                          }}
                        >
                          Update Members
                        </button>
                        {lc.status === 'active' && (
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(lc.id, 'inactive')}
                          >
                            Deactivate
                          </button>
                        )}
                        {lc.status === 'inactive' && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(lc.id, 'active')}
                          >
                            Activate
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            if (confirm(`Are you sure you want to close ${lc.name}?`)) {
                              handleStatusChange(lc.id, 'closed')
                            }
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .form-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: var(--background-secondary);
          border-radius: 0.5rem;
          border: 1px solid var(--border);
        }
        
        .form-section h4 {
          margin: 0 0 1rem 0;
          color: var(--primary);
          font-size: 1.1rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
        }
      `}</style>
    </div>
  )
}