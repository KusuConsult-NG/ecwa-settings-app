"use client"
import { useState, useEffect } from "react"
import { AgencyRecord, getStatusColor, getStatusIcon, getTypeColor } from '@/lib/agencies'
import { formatCurrency } from '@/lib/income'

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<AgencyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'ministry' as 'ministry' | 'department' | 'committee' | 'fellowship' | 'group',
    description: '',
    leader: {
      name: '',
      email: '',
      phone: ''
    },
    memberCount: 0,
    establishedDate: '',
    meetingDay: '',
    meetingTime: '',
    venue: '',
    parentOrganization: '',
    objectives: [] as string[],
    activities: [] as string[],
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    }
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  })

  useEffect(() => {
    loadAgencies()
  }, [])

  const loadAgencies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agencies')
      if (response.ok) {
        const data = await response.json()
        setAgencies(data.agencies || [])
      } else {
        setError('Failed to load agencies')
      }
    } catch (err) {
      setError('Failed to load agencies')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadAgencies()
        setShowForm(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save agency')
      }
    } catch (err) {
      setError('Failed to save agency')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'ministry',
      description: '',
      leader: {
        name: '',
        email: '',
        phone: ''
      },
      memberCount: 0,
      establishedDate: '',
      meetingDay: '',
      meetingTime: '',
      venue: '',
      parentOrganization: '',
      objectives: [],
      activities: [],
      contactInfo: {
        email: '',
        phone: '',
        address: ''
      }
    })
    setEditingId(null)
  }

  const handleEdit = (agency: AgencyRecord) => {
    setFormData({
      name: agency.name,
      type: agency.type,
      description: agency.description,
      leader: agency.leader,
      memberCount: agency.memberCount,
      establishedDate: agency.establishedDate,
      meetingDay: agency.meetingDay,
      meetingTime: agency.meetingTime,
      venue: agency.venue,
      parentOrganization: agency.parentOrganization || '',
      objectives: agency.objectives,
      activities: agency.activities,
      contactInfo: agency.contactInfo
    })
    setEditingId(agency.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this agency?')) {
      try {
        const response = await fetch(`/api/agencies/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadAgencies()
        } else {
          setError('Failed to delete agency')
        }
      } catch (err) {
        setError('Failed to delete agency')
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/agencies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await loadAgencies()
      } else {
        setError('Failed to update status')
      }
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const filteredAgencies = agencies.filter(agency => {
    if (filters.status && agency.status !== filters.status) return false
    if (filters.type && agency.type !== filters.type) return false
    if (filters.search && !agency.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading agencies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Groups & Agencies Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Agency
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="ministry">Ministry</option>
              <option value="department">Department</option>
              <option value="committee">Committee</option>
              <option value="fellowship">Fellowship</option>
              <option value="group">Group</option>
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
            {editingId ? 'Edit Agency' : 'Add New Agency'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Agency Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  required
                >
                  <option value="ministry">Ministry</option>
                  <option value="department">Department</option>
                  <option value="committee">Committee</option>
                  <option value="fellowship">Fellowship</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={3}
              />
            </div>

            <h4>Leader Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Leader Name *</label>
                <input
                  type="text"
                  value={formData.leader.name}
                  onChange={(e) => setFormData({
                    ...formData, 
                    leader: {...formData.leader, name: e.target.value}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Leader Email *</label>
                <input
                  type="email"
                  value={formData.leader.email}
                  onChange={(e) => setFormData({
                    ...formData, 
                    leader: {...formData.leader, email: e.target.value}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Leader Phone</label>
                <input
                  type="tel"
                  value={formData.leader.phone}
                  onChange={(e) => setFormData({
                    ...formData, 
                    leader: {...formData.leader, phone: e.target.value}
                  })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Member Count</label>
                <input
                  type="number"
                  value={formData.memberCount}
                  onChange={(e) => setFormData({...formData, memberCount: Number(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Established Date</label>
                <input
                  type="date"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData({...formData, establishedDate: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Meeting Day</label>
                <input
                  type="text"
                  value={formData.meetingDay}
                  onChange={(e) => setFormData({...formData, meetingDay: e.target.value})}
                  placeholder="e.g., Every Sunday"
                />
              </div>
              <div className="form-group">
                <label>Meeting Time</label>
                <input
                  type="text"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({...formData, meetingTime: e.target.value})}
                  placeholder="e.g., 10:00 AM"
                />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
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

      {/* Agencies List */}
      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>
          Agencies ({filteredAgencies.length})
        </h3>
        
        {filteredAgencies.length === 0 ? (
          <p>No agencies found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Leader</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgencies.map((agency) => (
                  <tr key={agency.id}>
                    <td>
                      <div>
                        <strong>{agency.name}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{agency.description}</small>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getTypeColor(agency.type),
                          color: 'white'
                        }}
                      >
                        {agency.type}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{agency.leader.name}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{agency.leader.email}</small>
                      </div>
                    </td>
                    <td>{agency.memberCount}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(agency.status),
                          color: 'white'
                        }}
                      >
                        {getStatusIcon(agency.status)} {agency.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(agency)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(agency.id)}
                        >
                          Delete
                        </button>
                        <select
                          value={agency.status}
                          onChange={(e) => handleStatusChange(agency.id, e.target.value)}
                          style={{fontSize: '12px', padding: '2px 4px'}}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
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