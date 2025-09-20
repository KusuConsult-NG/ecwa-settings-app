"use client"
import { useState, useEffect } from "react"
import { LCRecord, getStatusColor, getStatusIcon, LC_STATUSES } from '@/lib/lc'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function LCPage() {
  const [lcs, setLcs] = useState<LCRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    establishedDate: '',
    memberCount: 0,
    leaderId: '',
    contactEmail: '',
    contactPhone: '',
    notes: ''
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
      code: '',
      address: '',
      city: '',
      state: '',
      country: '',
      establishedDate: '',
      memberCount: 0,
      leaderId: '',
      contactEmail: '',
      contactPhone: '',
      notes: ''
    })
    setEditingId(null)
  }

  const handleEdit = (lc: LCRecord) => {
    setFormData({
      name: lc.name,
      code: lc.code,
      address: lc.address,
      city: lc.city,
      state: lc.state,
      country: lc.country,
      establishedDate: lc.establishedDate,
      memberCount: lc.memberCount,
      leaderId: lc.leaderId,
      contactEmail: lc.contactEmail,
      contactPhone: lc.contactPhone,
      notes: lc.notes || ''
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
                <label>LC Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
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
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Phone *</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Member Count *</label>
                <input
                  type="number"
                  value={formData.memberCount}
                  onChange={(e) => setFormData({...formData, memberCount: Number(e.target.value)})}
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

            <div className="form-group">
              <label>Leader ID *</label>
              <input
                type="text"
                value={formData.leaderId}
                onChange={(e) => setFormData({...formData, leaderId: e.target.value})}
                required
                placeholder="Enter leader ID"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
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
                  <th>Code</th>
                  <th>City</th>
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
                    <td>{lc.code}</td>
                    <td>{lc.city}</td>
                    <td>
                      <div>
                        <strong>{lc.leaderName}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{lc.contactEmail}</small>
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