"use client"
import { useState, useEffect } from "react"

interface LCRecord {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  pastor: string;
  establishedDate: string;
  status: 'active' | 'inactive' | 'suspended';
  memberCount: number;
  lccId: string;
  createdAt: string;
  updatedAt: string;
}

export default function LCPage() {
  const [lcs, setLcs] = useState<LCRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    pastor: '',
    establishedDate: '',
    memberCount: 0,
    lccId: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Mock LCC data for dropdown
  const lccs = [
    { id: 'lcc1', name: 'ECWA Jos Central LCC' },
    { id: 'lcc2', name: 'ECWA Bukuru LCC' },
    { id: 'lcc3', name: 'ECWA Kaduna LCC' }
  ]

  // Mock data
  useEffect(() => {
    setLcs([
      {
        id: 'lc1',
        name: 'ECWA GoodNews HighCost - LC',
        address: '456 HighCost Road, Jos, Plateau State',
        phone: '+234-802-345-6789',
        email: 'goodnews@ecwa.org',
        pastor: 'Rev. Mary Johnson',
        establishedDate: '2021-03-20',
        status: 'active',
        memberCount: 75,
        lccId: 'lcc1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ])
    setLoading(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      if (editingId) {
        // Update existing LC
        setLcs(prev => prev.map(lc => 
          lc.id === editingId 
            ? { ...lc, ...formData, updatedAt: new Date().toISOString() }
            : lc
        ))
      } else {
        // Create new LC
        const newLC: LCRecord = {
          id: `lc_${Date.now()}`,
          ...formData,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setLcs(prev => [...prev, newLC])
      }
      
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        pastor: '',
        establishedDate: '',
        memberCount: 0,
        lccId: ''
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      setError('Failed to save LC')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (lc: LCRecord) => {
    setFormData({
      name: lc.name,
      address: lc.address,
      phone: lc.phone,
      email: lc.email,
      pastor: lc.pastor,
      establishedDate: lc.establishedDate,
      memberCount: lc.memberCount,
      lccId: lc.lccId
    })
    setEditingId(lc.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this LC?')) {
      setLcs(prev => prev.filter(lc => lc.id !== id))
    }
  }

  const handleStatusChange = (id: string, status: 'active' | 'inactive' | 'suspended') => {
    setLcs(prev => prev.map(lc => 
      lc.id === id 
        ? { ...lc, status, updatedAt: new Date().toISOString() }
        : lc
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success)'
      case 'inactive': return 'var(--muted)'
      case 'suspended': return 'var(--danger)'
      default: return 'var(--muted)'
    }
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>LC Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading LCs...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>LC Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New LC'}
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
            {editingId ? 'Edit LC' : 'Add New LC'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">LC Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                  placeholder="Enter LC name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pastor">Pastor Name *</label>
                <input
                  type="text"
                  id="pastor"
                  value={formData.pastor}
                  onChange={(e) => setFormData(prev => ({...prev, pastor: e.target.value}))}
                  required
                  placeholder="Enter pastor name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                placeholder="Enter LC address"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lccId">Parent LCC *</label>
                <select
                  id="lccId"
                  value={formData.lccId}
                  onChange={(e) => setFormData(prev => ({...prev, lccId: e.target.value}))}
                  required
                >
                  <option value="">Select LCC</option>
                  {lccs.map(lcc => (
                    <option key={lcc.id} value={lcc.id}>{lcc.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="establishedDate">Established Date</label>
                <input
                  type="date"
                  id="establishedDate"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData(prev => ({...prev, establishedDate: e.target.value}))}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="memberCount">Member Count</label>
              <input
                type="number"
                id="memberCount"
                value={formData.memberCount}
                onChange={(e) => setFormData(prev => ({...prev, memberCount: parseInt(e.target.value) || 0}))}
                min="0"
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
                    name: '',
                    address: '',
                    phone: '',
                    email: '',
                    pastor: '',
                    establishedDate: '',
                    memberCount: 0,
                    lccId: ''
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
                {submitting ? 'Saving...' : (editingId ? 'Update LC' : 'Add LC')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>LC List ({lcs.length})</h3>
        
        {lcs.length === 0 ? (
          <p>No LCs found. Add one using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Pastor</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>LCC</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lcs.map((lc) => (
                  <tr key={lc.id}>
                    <td><strong>{lc.name}</strong></td>
                    <td>{lc.pastor}</td>
                    <td>{lc.phone}</td>
                    <td>{lc.email}</td>
                    <td>{lccs.find(lcc => lcc.id === lc.lccId)?.name || 'Unknown'}</td>
                    <td>{lc.memberCount}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(lc.status),
                          color: 'white'
                        }}
                      >
                        {lc.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
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
                          onClick={() => handleStatusChange(lc.id, 'suspended')}
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
    </section>
  )
}
