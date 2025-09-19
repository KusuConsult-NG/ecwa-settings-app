"use client"
import { useState, useEffect } from "react"

interface GroupRecord {
  id: string;
  name: string;
  type: 'ministry' | 'department' | 'committee' | 'fellowship' | 'group';
  description: string;
  leader: {
    name: string;
    email: string;
    phone: string;
  };
  memberCount: number;
  establishedDate: string;
  meetingDay: string;
  meetingTime: string;
  venue: string;
  status: 'active' | 'inactive' | 'suspended';
  parentOrganization?: string;
  parentOrganizationName?: string;
  objectives: string[];
  activities: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AgenciesPage() {
  const [groups, setGroups] = useState<GroupRecord[]>([])
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

  const groupTypes = [
    { value: 'ministry', label: 'Ministry', color: 'var(--primary)' },
    { value: 'department', label: 'Department', color: 'var(--info)' },
    { value: 'committee', label: 'Committee', color: 'var(--warning)' },
    { value: 'fellowship', label: 'Fellowship', color: 'var(--success)' },
    { value: 'group', label: 'Group', color: 'var(--muted)' }
  ]

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ]

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]

  // Fetch data from API
  useEffect(() => {
    fetchGroups()
  }, [filters])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.type) params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/agencies?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setGroups(data.agencies || [])
      } else {
        setError(data.error || 'Failed to fetch groups')
      }
    } catch (err) {
      setError('Failed to fetch groups')
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

      const data = await response.json()

      if (response.ok) {
        await fetchGroups()
        
        // Reset form
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
        setShowForm(false)
        setEditingId(null)
      } else {
        setError(data.error || 'Failed to save group')
      }
    } catch (error) {
      setError('Failed to save group')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      const response = await fetch(`/api/agencies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (response.ok) {
        await fetchGroups()
      } else {
        setError(data.error || 'Failed to update group status')
      }
    } catch (error) {
      setError('Failed to update group status')
    }
  }

  const handleMembersUpdate = async (id: string, memberCount: number) => {
    try {
      const response = await fetch(`/api/agencies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberCount })
      })

      const data = await response.json()

      if (response.ok) {
        await fetchGroups()
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
      default: return 'var(--muted)'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ministry': return 'var(--primary)'
      case 'department': return 'var(--info)'
      case 'committee': return 'var(--warning)'
      case 'fellowship': return 'var(--success)'
      case 'group': return 'var(--muted)'
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

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading groups data...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Agencies & Groups Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Group'}
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
              {groupTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by name, description, or leader..."
            />
          </div>
        </div>
      </div>

      {/* Group Form */}
      {showForm && (
        <div className="card">
          <h2>{editingId ? 'Edit Group' : 'Add New Group'}</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Group Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Youth Fellowship"
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
                  {groupTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Established Date *</label>
                <input
                  type="date"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe the group's purpose and activities..."
                required
              />
            </div>

            <div className="form-section">
              <h4>Leader Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Leader Name *</label>
                  <input
                    type="text"
                    value={formData.leader.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      leader: { ...formData.leader, name: e.target.value }
                    })}
                    placeholder="Leader's full name"
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
                      leader: { ...formData.leader, email: e.target.value }
                    })}
                    placeholder="leader@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Leader Phone *</label>
                  <input
                    type="tel"
                    value={formData.leader.phone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      leader: { ...formData.leader, phone: e.target.value }
                    })}
                    placeholder="+234-xxx-xxx-xxxx"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Member Count</label>
                <input
                  type="number"
                  value={formData.memberCount}
                  onChange={(e) => setFormData({ ...formData, memberCount: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Meeting Day</label>
                <select
                  value={formData.meetingDay}
                  onChange={(e) => setFormData({ ...formData, meetingDay: e.target.value })}
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Meeting Time</label>
                <input
                  type="time"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Meeting Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g., Main Hall, Conference Room"
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
                  setEditingId(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups List */}
      <div className="card">
        <h2>Groups & Agencies ({groups.length})</h2>
        {groups.length === 0 ? (
          <div className="empty-state">
            <p>No groups found. Add a new group to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Type</th>
                  <th>Leader</th>
                  <th>Members</th>
                  <th>Meeting</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(group => (
                  <tr key={group.id}>
                    <td>
                      <div>
                        <strong>{group.name}</strong>
                        <br />
                        <small>{group.description}</small>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ backgroundColor: getTypeColor(group.type) }}
                      >
                        {groupTypes.find(t => t.value === group.type)?.label}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{group.leader.name}</strong>
                        <br />
                        <small>{group.leader.phone}</small>
                      </div>
                    </td>
                    <td>
                      <strong>{group.memberCount}</strong>
                    </td>
                    <td>
                      <div>
                        {group.meetingDay && group.meetingTime ? (
                          <>
                            <strong>{group.meetingDay}</strong>
                            <br />
                            <small>{group.meetingTime}</small>
                            {group.venue && (
                              <>
                                <br />
                                <small>{group.venue}</small>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="text-muted">Not scheduled</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ backgroundColor: getStatusColor(group.status) }}
                      >
                        {group.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            const newCount = prompt(`Update member count for ${group.name}:`, group.memberCount.toString())
                            if (newCount && !isNaN(Number(newCount))) {
                              handleMembersUpdate(group.id, Number(newCount))
                            }
                          }}
                        >
                          Update Members
                        </button>
                        {group.status === 'active' && (
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(group.id, 'inactive')}
                          >
                            Deactivate
                          </button>
                        )}
                        {group.status === 'inactive' && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(group.id, 'active')}
                          >
                            Activate
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            if (confirm(`Are you sure you want to suspend ${group.name}?`)) {
                              handleStatusChange(group.id, 'suspended')
                            }
                          }}
                        >
                          Suspend
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
        
        .text-muted {
          color: var(--muted);
          font-style: italic;
        }
      `}</style>
    </div>
  )
}