"use client"
import { useState, useEffect } from "react"
import { QueryRecord, getStatusColor, getStatusIcon, getPriorityColor, getCategoryColor, QUERY_CATEGORIES, QUERY_PRIORITIES, QUERY_STATUSES } from '@/lib/queries'
import { StaffRecord } from '@/lib/staff'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function QueriesPage() {
  const [queries, setQueries] = useState<QueryRecord[]>([])
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general' as 'general' | 'technical' | 'financial' | 'hr' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [queriesRes, staffRes] = await Promise.all([
        fetch('/api/queries'),
        fetch('/api/queries/assign')
      ])

      if (queriesRes.ok) {
        const queriesData = await queriesRes.json()
        setQueries(queriesData.queries || [])
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaff(staffData.staff || [])
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadData()
        setShowForm(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save query')
      }
    } catch (err) {
      setError('Failed to save query')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium'
    })
    setEditingId(null)
  }

  const handleEdit = (query: QueryRecord) => {
    setFormData({
      title: query.title,
      description: query.description,
      category: query.category,
      priority: query.priority
    })
    setEditingId(query.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      try {
        const response = await fetch(`/api/queries/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadData()
        } else {
          setError('Failed to delete query')
        }
      } catch (err) {
        setError('Failed to delete query')
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/queries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await loadData()
      } else {
        setError('Failed to update status')
      }
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const handleAssign = async (id: string, staffId: string) => {
    try {
      const response = await fetch(`/api/queries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'assigned',
          assignedTo: staffId
        })
      })

      if (response.ok) {
        await loadData()
      } else {
        setError('Failed to assign query')
      }
    } catch (err) {
      setError('Failed to assign query')
    }
  }

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId)
    return staffMember ? staffMember.name : 'Unknown'
  }

  const filteredQueries = queries.filter(query => {
    if (filters.status && query.status !== filters.status) return false
    if (filters.category && query.category !== filters.category) return false
    if (filters.priority && query.priority !== filters.priority) return false
    if (filters.search && !query.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading queries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Queries Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Submit Query
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
              {QUERY_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              {QUERY_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="">All Priorities</option>
              {QUERY_PRIORITIES.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by title"
            />
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>
            {editingId ? 'Edit Query' : 'Submit New Query'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                  required
                >
                  {QUERY_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                  required
                >
                  {QUERY_PRIORITIES.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : (editingId ? 'Update' : 'Submit Query')}
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

      {/* Queries List */}
      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>
          Queries ({filteredQueries.length})
        </h3>
        
        {filteredQueries.length === 0 ? (
          <p>No queries found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((query) => (
                  <tr key={query.id}>
                    <td>
                      <div>
                        <strong>{query.title}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{query.description}</small>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getCategoryColor(query.category),
                          color: 'white'
                        }}
                      >
                        {query.category}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getPriorityColor(query.priority),
                          color: 'white'
                        }}
                      >
                        {query.priority}
                      </span>
                    </td>
                    <td>
                      {query.assignedToName || 'Unassigned'}
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(query.status),
                          color: 'white'
                        }}
                      >
                        {getStatusIcon(query.status)} {query.status}
                      </span>
                    </td>
                    <td>{new Date(query.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(query)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(query.id)}
                        >
                          Delete
                        </button>
                        <select
                          value={query.status}
                          onChange={(e) => handleStatusChange(query.id, e.target.value)}
                          style={{fontSize: '12px', padding: '2px 4px'}}
                        >
                          {QUERY_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        {query.status === 'open' && (
                          <select
                            onChange={(e) => handleAssign(query.id, e.target.value)}
                            style={{fontSize: '12px', padding: '2px 4px'}}
                          >
                            <option value="">Assign to...</option>
                            {staff.map(member => (
                              <option key={member.id} value={member.id}>{member.name}</option>
                            ))}
                          </select>
                        )}
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