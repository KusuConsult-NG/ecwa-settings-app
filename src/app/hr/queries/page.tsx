"use client"
import { useState, useEffect } from "react"

interface QueryRecord {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'technical' | 'financial' | 'hr' | 'administrative' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  submittedBy: string;
  submittedByName: string;
  submittedByEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  assignedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolution?: string;
  tags: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
}

export default function QueriesPage() {
  const [queries, setQueries] = useState<QueryRecord[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general' as 'general' | 'technical' | 'financial' | 'hr' | 'administrative' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    tags: [] as string[],
    attachments: [] as string[]
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    assignedTo: '',
    search: ''
  })
  const [selectedQuery, setSelectedQuery] = useState<QueryRecord | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolution, setResolution] = useState('')

  const categories = [
    { value: 'general', label: 'General', color: 'var(--muted)' },
    { value: 'technical', label: 'Technical', color: 'var(--info)' },
    { value: 'financial', label: 'Financial', color: 'var(--warning)' },
    { value: 'hr', label: 'HR', color: 'var(--primary)' },
    { value: 'administrative', label: 'Administrative', color: 'var(--success)' },
    { value: 'other', label: 'Other', color: 'var(--danger)' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'var(--success)' },
    { value: 'medium', label: 'Medium', color: 'var(--info)' },
    { value: 'high', label: 'High', color: 'var(--warning)' },
    { value: 'urgent', label: 'Urgent', color: 'var(--danger)' }
  ]

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  // Fetch data from APIs
  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.category) params.append('category', filters.category)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo)
      if (filters.search) params.append('search', filters.search)

      // Fetch data in parallel
      const [staffResponse, queriesResponse] = await Promise.all([
        fetch('/api/staff/list'),
        fetch(`/api/queries?${params.toString()}`)
      ])

      const [staffData, queriesData] = await Promise.all([
        staffResponse.json(),
        queriesResponse.json()
      ])

      if (staffResponse.ok) {
        setStaff(staffData.staff || [])
      }

      if (queriesResponse.ok) {
        setQueries(queriesData.queries || [])
      } else {
        setError(queriesData.error || 'Failed to fetch queries data')
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
      const response = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh queries list
        await fetchData()
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'general',
          priority: 'medium',
          tags: [],
          attachments: []
        })
        setShowForm(false)
        setEditingId(null)
      } else {
        setError(data.error || 'Failed to submit query')
      }
    } catch (error) {
      setError('Failed to submit query')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/queries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh queries list
        await fetchData()
      } else {
        setError(data.error || 'Failed to update query status')
      }
    } catch (error) {
      setError('Failed to update query status')
    }
  }

  const handleAssign = async (queryId: string, assignedTo: string) => {
    try {
      const response = await fetch('/api/queries/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId, assignedTo })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh queries list
        await fetchData()
        setShowAssignModal(false)
        setSelectedQuery(null)
      } else {
        setError(data.error || 'Failed to assign query')
      }
    } catch (error) {
      setError('Failed to assign query')
    }
  }

  const handleResolve = async (queryId: string) => {
    try {
      const response = await fetch(`/api/queries/${queryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', resolution })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh queries list
        await fetchData()
        setShowResolveModal(false)
        setSelectedQuery(null)
        setResolution('')
      } else {
        setError(data.error || 'Failed to resolve query')
      }
    } catch (error) {
      setError('Failed to resolve query')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'var(--warning)'
      case 'in_progress': return 'var(--info)'
      case 'resolved': return 'var(--success)'
      case 'closed': return 'var(--muted)'
      case 'cancelled': return 'var(--danger)'
      default: return 'var(--muted)'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading queries data...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Queries Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Submit Query'}
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
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priorities</option>
              {priorities.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            >
              <option value="">All Staff</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by title, description, or tags..."
            />
          </div>
        </div>
      </div>

      {/* Query Submission Form */}
      {showForm && (
        <div className="card">
          <h2>Submit New Query</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the query"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  required
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  required
                >
                  {priorities.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                placeholder="Provide detailed information about your query..."
                required
              />
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                placeholder="e.g., urgent, bug, feature-request"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Query'}
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

      {/* Queries List */}
      <div className="card">
        <h2>Queries ({queries.length})</h2>
        {queries.length === 0 ? (
          <div className="empty-state">
            <p>No queries found. Submit a query to get started.</p>
          </div>
        ) : (
          <div className="queries-list">
            {queries.map(query => (
              <div key={query.id} className="query-card">
                <div className="query-header">
                  <div className="query-title">
                    <h3>{query.title}</h3>
                    <div className="query-meta">
                      <span 
                        className="badge"
                        style={{ backgroundColor: categories.find(c => c.value === query.category)?.color }}
                      >
                        {categories.find(c => c.value === query.category)?.label}
                      </span>
                      <span 
                        className="badge"
                        style={{ backgroundColor: priorities.find(p => p.value === query.priority)?.color }}
                      >
                        {priorities.find(p => p.value === query.priority)?.label}
                      </span>
                      <span 
                        className="badge"
                        style={{ backgroundColor: getStatusColor(query.status) }}
                      >
                        {query.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="query-actions">
                    <div className="btn-group">
                      {query.status === 'open' && (
                        <>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedQuery(query)
                              setShowAssignModal(true)
                            }}
                          >
                            Assign
                          </button>
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(query.id, 'in_progress')}
                          >
                            Start
                          </button>
                        </>
                      )}
                      {query.status === 'in_progress' && (
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            setSelectedQuery(query)
                            setShowResolveModal(true)
                          }}
                        >
                          Resolve
                        </button>
                      )}
                      {query.status === 'resolved' && (
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleStatusChange(query.id, 'closed')}
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="query-body">
                  <p>{query.description}</p>
                  
                  {query.tags.length > 0 && (
                    <div className="query-tags">
                      {query.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="query-footer">
                  <div className="query-info">
                    <span>Submitted by <strong>{query.submittedByName}</strong></span>
                    <span>•</span>
                    <span>{getTimeAgo(query.createdAt)}</span>
                    {query.assignedToName && (
                      <>
                        <span>•</span>
                        <span>Assigned to <strong>{query.assignedToName}</strong></span>
                      </>
                    )}
                  </div>
                  {query.resolution && (
                    <div className="query-resolution">
                      <strong>Resolution:</strong> {query.resolution}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedQuery && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Assign Query</h3>
            <p>Assign "{selectedQuery.title}" to a staff member:</p>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAssign(selectedQuery.id, e.target.value)
                }
              }}
            >
              <option value="">Select staff member</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.position}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedQuery(null)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedQuery && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Resolve Query</h3>
            <p>Provide resolution details for "{selectedQuery.title}":</p>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              placeholder="Describe how the query was resolved..."
            />
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => handleResolve(selectedQuery.id)}
                disabled={!resolution.trim()}
              >
                Resolve
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowResolveModal(false)
                  setSelectedQuery(null)
                  setResolution('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .queries-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .query-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }
        
        .query-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .query-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .query-title h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text);
        }
        
        .query-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .query-body {
          margin-bottom: 1rem;
        }
        
        .query-body p {
          margin: 0 0 1rem 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        
        .query-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .tag {
          background: var(--background-secondary);
          color: var(--text-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
        }
        
        .query-footer {
          border-top: 1px solid var(--border);
          padding-top: 1rem;
        }
        
        .query-info {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .query-resolution {
          background: var(--success-light);
          padding: 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.9rem;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: var(--background);
          border-radius: 0.5rem;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .modal h3 {
          margin: 0 0 1rem 0;
        }
        
        .modal p {
          margin: 0 0 1rem 0;
          color: var(--text-secondary);
        }
        
        .modal select,
        .modal textarea {
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
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