"use client"
import { useState, useEffect } from "react"

interface QueryRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  submittedBy: string;
  submittedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  response?: string;
  submittedAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function QueriesPage() {
  const [queries, setQueries] = useState<QueryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignedTo: '',
    response: ''
  })

  const categories = [
    'General Inquiry', 'Technical Issue', 'HR Related', 'Finance Related',
    'Ministry Related', 'Administrative', 'Complaint', 'Suggestion', 'Other'
  ]

  const staffOptions = [
    { id: 'staff1', name: 'Rev. John Doe' },
    { id: 'staff2', name: 'Mary Johnson' },
    { id: 'staff3', name: 'David Wilson' }
  ]

  useEffect(() => {
    fetchQueries()
  }, [])

  const fetchQueries = async () => {
    try {
      setLoading(true)
      // Mock data - replace with API call
      const mockQueries: QueryRecord[] = [
        {
          id: 'query1',
          title: 'Request for Leave',
          description: 'I would like to request a 2-week leave for personal reasons.',
          category: 'HR Related',
          priority: 'medium',
          status: 'open',
          submittedBy: 'user1',
          submittedByName: 'John Smith',
          submittedAt: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
      setQueries(mockQueries)
    } catch (err) {
      setError('Failed to fetch queries')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const assignedStaff = staffOptions.find(s => s.id === formData.assignedTo)
      
      if (editingId) {
        // Update existing query
        setQueries(prev => prev.map(q => 
          q.id === editingId 
            ? { 
                ...q, 
                ...formData, 
                assignedToName: assignedStaff?.name,
                updatedAt: new Date().toISOString() 
              }
            : q
        ))
      } else {
        // Create new query
        const newQuery: QueryRecord = {
          id: `query_${Date.now()}`,
          ...formData,
          status: 'open',
          submittedBy: 'current_user',
          submittedByName: 'Current User',
          assignedToName: assignedStaff?.name,
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setQueries(prev => [...prev, newQuery])
      }
      
      setShowForm(false)
      setEditingId(null)
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        assignedTo: '',
        response: ''
      })
    } catch (err) {
      setError('Failed to save query')
    }
  }

  const handleEdit = (query: QueryRecord) => {
    setFormData({
      title: query.title,
      description: query.description,
      category: query.category,
      priority: query.priority,
      assignedTo: query.assignedTo || '',
      response: query.response || ''
    })
    setEditingId(query.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      setQueries(prev => prev.filter(q => q.id !== id))
    }
  }

  const handleStatusChange = (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    setQueries(prev => prev.map(q => 
      q.id === id 
        ? { 
            ...q, 
            status, 
            resolvedAt: status === 'resolved' || status === 'closed' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString() 
          }
        : q
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'var(--danger)'
      case 'high': return '#ff6b35'
      case 'medium': return 'var(--warning)'
      case 'low': return 'var(--success)'
      default: return 'var(--muted)'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'var(--warning)'
      case 'in_progress': return 'var(--primary)'
      case 'resolved': return 'var(--success)'
      case 'closed': return 'var(--muted)'
      default: return 'var(--muted)'
    }
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Queries Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading queries...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Queries Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add Query
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{marginBottom: '1rem'}}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>
            {editingId ? 'Edit Query' : 'Add New Query'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  required
                  placeholder="Enter query title"
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({...prev, priority: e.target.value as any}))}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="assignedTo">Assign To</label>
                <select
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData(prev => ({...prev, assignedTo: e.target.value}))}
                >
                  <option value="">Select Staff Member</option>
                  {staffOptions.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                required
                placeholder="Enter query description"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="response">Response</label>
              <textarea
                id="response"
                value={formData.response}
                onChange={(e) => setFormData(prev => ({...prev, response: e.target.value}))}
                placeholder="Enter response (if any)"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    title: '',
                    description: '',
                    category: '',
                    priority: 'medium',
                    assignedTo: '',
                    response: ''
                  })
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Query' : 'Add Query'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Queries List ({queries.length})</h3>
        
        {queries.length === 0 ? (
          <p>No queries found. Add one using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted By</th>
                  <th>Assigned To</th>
                  <th>Submitted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((query) => (
                  <tr key={query.id}>
                    <td><strong>{query.title}</strong></td>
                    <td>{query.category}</td>
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
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(query.status),
                          color: 'white'
                        }}
                      >
                        {query.status}
                      </span>
                    </td>
                    <td>{query.submittedByName}</td>
                    <td>{query.assignedToName || '-'}</td>
                    <td>{new Date(query.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
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
                        {query.status === 'open' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleStatusChange(query.id, 'in_progress')}
                          >
                            Start
                          </button>
                        )}
                        {query.status === 'in_progress' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(query.id, 'resolved')}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
