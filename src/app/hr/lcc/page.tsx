"use client"
import { useState, useEffect } from "react"
import { LCCRecord, getStatusColor, getStatusIcon, LCC_STATUSES } from '@/lib/lcc'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function LCCPage() {
  const [lccs, setLccs] = useState<LCCRecord[]>([])
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
    capacity: 0,
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
    loadLCCs()
  }, [])

  const loadLCCs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lcc')
      if (response.ok) {
        const data = await response.json()
        setLccs(data.lccs || [])
      } else {
        setError('Failed to load LCCs')
      }
    } catch (err) {
      setError('Failed to load LCCs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/lcc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadLCCs()
        setShowForm(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save LCC')
      }
    } catch (err) {
      setError('Failed to save LCC')
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
      capacity: 0,
      leaderId: '',
      contactEmail: '',
      contactPhone: '',
      notes: ''
    })
    setEditingId(null)
  }

  const handleEdit = (lcc: LCCRecord) => {
    setFormData({
      name: lcc.name,
      code: lcc.code,
      address: lcc.address,
      city: lcc.city,
      state: lcc.state,
      country: lcc.country,
      establishedDate: lcc.establishedDate,
      capacity: lcc.capacity,
      leaderId: lcc.leaderId,
      contactEmail: lcc.contactEmail,
      contactPhone: lcc.contactPhone,
      notes: lcc.notes || ''
    })
    setEditingId(lcc.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this LCC?')) {
      try {
        const response = await fetch(`/api/lcc/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadLCCs()
        } else {
          setError('Failed to delete LCC')
        }
      } catch (err) {
        setError('Failed to delete LCC')
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/lcc/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await loadLCCs()
      } else {
        setError('Failed to update status')
      }
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const filteredLCCs = lccs.filter(lcc => {
    if (filters.status && lcc.status !== filters.status) return false
    if (filters.search && !lcc.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading LCCs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>LCC Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add LCC
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
              {LCC_STATUSES.map(status => (
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
            {editingId ? 'Edit LCC' : 'Add New LCC'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>LCC Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>LCC Code *</label>
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
                <label>Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
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

      {/* LCC List */}
      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>
          LCCs ({filteredLCCs.length})
        </h3>
        
        {filteredLCCs.length === 0 ? (
          <p>No LCCs found.</p>
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
                {filteredLCCs.map((lcc) => (
                  <tr key={lcc.id}>
                    <td>
                      <div>
                        <strong>{lcc.name}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{lcc.address}</small>
                      </div>
                    </td>
                    <td>{lcc.code}</td>
                    <td>{lcc.city}</td>
                    <td>
                      <div>
                        <strong>{lcc.leaderName}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{lcc.contactEmail}</small>
                      </div>
                    </td>
                    <td>{lcc.memberCount}/{lcc.capacity}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(lcc.status),
                          color: 'white'
                        }}
                      >
                        {getStatusIcon(lcc.status)} {lcc.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(lcc)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(lcc.id)}
                        >
                          Delete
                        </button>
                        <select
                          value={lcc.status}
                          onChange={(e) => handleStatusChange(lcc.id, e.target.value)}
                          style={{fontSize: '12px', padding: '2px 4px'}}
                        >
                          {LCC_STATUSES.map(status => (
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