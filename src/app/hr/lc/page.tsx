"use client"
import { useState, useEffect } from "react"
import { LCRecord, getStatusColor, getStatusIcon, LC_STATUSES } from '@/lib/lc'

export default function LCPage() {
  const [lcs, setLcs] = useState<LCRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    maxCapacity: 0,
    establishedDate: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })

  useEffect(() => {
    loadLCs()
  }, [])

  const loadLCs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lc')
      if (response.ok) {
        const data = await response.json()
        setLcs(data.lcs || [])
      } else {
        setError('Failed to load LCs')
      }
    } catch (err) {
      setError('Failed to load LCs')
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

      if (response.ok) {
        await loadLCs()
        setShowForm(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save LC')
      }
    } catch (err) {
      setError('Failed to save LC')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      address: '',
      phone: '',
      email: '',
      leaderName: '',
      leaderEmail: '',
      leaderPhone: '',
      maxCapacity: 0,
      establishedDate: ''
    })
    setEditingId(null)
  }

  const handleEdit = (lc: LCRecord) => {
    setFormData({
      name: lc.name,
      location: lc.city,
      address: lc.address,
      phone: lc.contactPhone,
      email: lc.contactEmail,
      leaderName: lc.leaderName,
      leaderEmail: lc.leaderEmail,
      leaderPhone: lc.leaderPhone,
      maxCapacity: lc.maxCapacity,
      establishedDate: lc.establishedDate
    })
    setEditingId(lc.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this LC?')) {
      try {
        const response = await fetch(`/api/lc/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadLCs()
        } else {
          setError('Failed to delete LC')
        }
      } catch (err) {
        setError('Failed to delete LC')
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/lc/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await loadLCs()
      } else {
        setError('Failed to update status')
      }
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const filteredLCs = lcs.filter(lc => {
    if (filters.status && lc.status !== filters.status) return false
    if (filters.search && !lc.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading LCs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>LC Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add LC
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{marginBottom: '1rem'}}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{marginBottom: '2rem'}}>
        <h3 style={{marginBottom: '1rem'}}>Filters</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              {LC_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by name"
            />
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>
            {editingId ? 'Edit LC' : 'Add New LC'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>LC Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <h4>Leader Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Leader Name *</label>
                <input
                  type="text"
                  value={formData.leaderName}
                  onChange={(e) => setFormData({...formData, leaderName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Leader Email *</label>
                <input
                  type="email"
                  value={formData.leaderEmail}
                  onChange={(e) => setFormData({...formData, leaderEmail: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Leader Phone *</label>
                <input
                  type="tel"
                  value={formData.leaderPhone}
                  onChange={(e) => setFormData({...formData, leaderPhone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Max Capacity *</label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({...formData, maxCapacity: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Established Date *</label>
                <input
                  type="date"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData({...formData, establishedDate: e.target.value})}
                  required
                />
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
                  resetForm()
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LC List */}
      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>
          LCs ({filteredLCs.length})
        </h3>
        
        {filteredLCs.length === 0 ? (
          <p>No LCs found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Leader</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLCs.map((lc) => (
                  <tr key={lc.id}>
                    <td>
                      <div>
                        <strong>{lc.name}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{lc.address}</small>
                      </div>
                    </td>
                    <td>{lc.city}</td>
                    <td>
                      <div>
                        <strong>{lc.leaderName}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{lc.leaderEmail}</small>
                      </div>
                    </td>
                    <td>{lc.memberCount}/{lc.maxCapacity}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(lc.status),
                          color: 'white'
                        }}
                      >
                        {getStatusIcon(lc.status)} {lc.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(lc)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(lc.id)}
                        >
                          Delete
                        </button>
                        <select
                          value={lc.status}
                          onChange={(e) => handleStatusChange(lc.id, e.target.value)}
                          style={{fontSize: '12px', padding: '2px 4px'}}
                        >
                          {LC_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}