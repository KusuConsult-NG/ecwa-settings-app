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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [respondingToId, setRespondingToId] = useState<string | null>(null)

  const categories = [
    'General Inquiry', 'Technical Issue', 'HR Related', 'Financial', 
    'Administrative', 'Complaint', 'Suggestion', 'Other'
  ]

  // Mock data
  useEffect(() => {
    setQueries([
      {
        id: 'query1',
        title: 'Password Reset Request',
        description: 'I forgot my password and need help resetting it. Can someone assist me?',
        category: 'Technical Issue',
        priority: 'medium',
        status: 'open',
        submittedBy: 'user1',
        submittedByName: 'John Doe',
        submittedAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'query2',
        title: 'Leave Application Question',
        description: 'I want to apply for annual leave but I\'m not sure about the process. Can you guide me?',
        category: 'HR Related',
        priority: 'low',
        status: 'resolved',
        submittedBy: 'user2',
        submittedByName: 'Mary Johnson',
        assignedTo: 'admin1',
        assignedToName: 'Admin User',
        response: 'You can apply for leave through the HR section. Go to HR > Leave and fill out the application form.',
        submittedAt: '2024-01-14T14:20:00Z',
        resolvedAt: '2024-01-15T09:15:00Z',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-15T09:15:00Z'
      }
    ])
    setLoading(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      if (editingId) {
        // Update existing query
        setQueries(prev => prev.map(q => 
          q.id === editingId 
            ? { ...q, ...formData, updatedAt: new Date().toISOString() }
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
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setQueries(prev => [...prev, newQuery])
      }
      
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      setError('Failed to save query')
    } finally {
      setSubmitting(false)
    }
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
            resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString() 
          }
        : q
    ))
  }

  const handleResponse = (id: string) => {
    if (responseText.trim()) {
      setQueries(prev => prev.map(q => 
        q.id === id 
          ? { 
              ...q, 
              response: responseText,
              status: 'resolved' as const,
              resolvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString() 
            }
          : q
      ))
      setResponseText('')
      setRespondingToId(null)
    }
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
      case 'open': return 'var(--primary)'
      case 'in_progress': return 'var(--warning)'
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
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Submit New Query'}
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
            {editingId ? 'Edit Query' : 'Submit New Query'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="title">Query Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                required
                placeholder="Enter query title"
              />
            </div>

            <div className="form-row">
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
              <div className="form-group">
                <label htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'}))}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
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
                placeholder="Describe your query in detail"
                rows={4}
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
                    priority: 'medium'
                  })
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : (editingId ? 'Update Query' : 'Submit Query')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Queries ({queries.length})</h3>
        
        {queries.length === 0 ? (
          <p>No queries found. Submit one using the form above.</p>
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
                  <th>Submitted At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((query) => (
                  <tr key={query.id}>
                    <td>
                      <strong>{query.title}</strong>
                      {query.description && (
                        <div style={{fontSize: '12px', color: 'var(--muted)', marginTop: '4px'}}>
                          {query.description.length > 50 
                            ? `${query.description.substring(0, 50)}...` 
                            : query.description
                          }
                        </div>
                      )}
                    </td>
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
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(query.id, 'in_progress')}
                          >
                            Start
                          </button>
                        )}
                        {query.status === 'in_progress' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setRespondingToId(query.id)}
                          >
                            Respond
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

      {/* Response Modal */}
      {respondingToId && (
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
            <h3 style={{marginBottom: '1rem'}}>Respond to Query</h3>
            <div className="form-group">
              <label htmlFor="response">Response</label>
              <textarea
                id="response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Enter your response"
                rows={4}
                style={{width: '100%'}}
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setRespondingToId(null)
                  setResponseText('')
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleResponse(respondingToId)}
                disabled={!responseText.trim()}
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
