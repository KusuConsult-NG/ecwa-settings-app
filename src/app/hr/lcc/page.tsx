"use client"
import { useState, useEffect } from "react"

interface LCCRecord {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  pastor: string;
  establishedDate: string;
  status: 'active' | 'inactive' | 'suspended';
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function LCCPage() {
  const [lccs, setLccs] = useState<LCCRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    pastor: '',
    establishedDate: '',
    memberCount: 0
  })

  useEffect(() => {
    fetchLCCs()
  }, [])

  const fetchLCCs = async () => {
    try {
      setLoading(true)
      // Mock data - replace with API call
      const mockLCCs: LCCRecord[] = [
        {
          id: 'lcc1',
          name: 'ECWA Jos Central LCC',
          address: '123 Church Street, Jos',
          phone: '+234-801-234-5678',
          email: 'joscentral@ecwa.org',
          pastor: 'Rev. John Doe',
          establishedDate: '2020-01-15',
          status: 'active',
          memberCount: 150,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
      setLCCs(mockLCCs)
    } catch (err) {
      setError('Failed to fetch LCCs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        // Update existing LCC
        setLCCs(prev => prev.map(lcc => 
          lcc.id === editingId 
            ? { ...lcc, ...formData, updatedAt: new Date().toISOString() }
            : lcc
        ))
      } else {
        // Create new LCC
        const newLCC: LCCRecord = {
          id: `lcc_${Date.now()}`,
          ...formData,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setLCCs(prev => [...prev, newLCC])
      }
      
      setShowForm(false)
      setEditingId(null)
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        pastor: '',
        establishedDate: '',
        memberCount: 0
      })
    } catch (err) {
      setError('Failed to save LCC')
    }
  }

  const handleEdit = (lcc: LCCRecord) => {
    setFormData({
      name: lcc.name,
      address: lcc.address,
      phone: lcc.phone,
      email: lcc.email,
      pastor: lcc.pastor,
      establishedDate: lcc.establishedDate,
      memberCount: lcc.memberCount
    })
    setEditingId(lcc.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this LCC?')) {
      setLCCs(prev => prev.filter(lcc => lcc.id !== id))
    }
  }

  const handleStatusChange = (id: string, status: 'active' | 'inactive' | 'suspended') => {
    setLCCs(prev => prev.map(lcc => 
      lcc.id === id 
        ? { ...lcc, status, updatedAt: new Date().toISOString() }
        : lcc
    ))
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>LCC Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading LCCs...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>LCC Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add LCC
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
            {editingId ? 'Edit LCC' : 'Add New LCC'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">LCC Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                  placeholder="Enter LCC name"
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

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                required
                placeholder="Enter LCC address"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  required
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  required
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="establishedDate">Established Date *</label>
                <input
                  type="date"
                  id="establishedDate"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData(prev => ({...prev, establishedDate: e.target.value}))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="memberCount">Member Count</label>
                <input
                  type="number"
                  id="memberCount"
                  value={formData.memberCount}
                  onChange={(e) => setFormData(prev => ({...prev, memberCount: parseInt(e.target.value) || 0}))}
                  min="0"
                  placeholder="Enter member count"
                />
              </div>
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
                    memberCount: 0
                  })
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update LCC' : 'Add LCC'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>LCC List ({lccs.length})</h3>
        
        {lccs.length === 0 ? (
          <p>No LCCs found. Add one using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Pastor</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Established</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lccs.map((lcc) => (
                  <tr key={lcc.id}>
                    <td><strong>{lcc.name}</strong></td>
                    <td>{lcc.pastor}</td>
                    <td>{lcc.phone}</td>
                    <td>{lcc.email}</td>
                    <td>{lcc.memberCount}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: lcc.status === 'active' ? 'var(--success)' : 
                                          lcc.status === 'inactive' ? 'var(--warning)' : 'var(--danger)',
                          color: 'white'
                        }}
                      >
                        {lcc.status}
                      </span>
                    </td>
                    <td>{new Date(lcc.establishedDate).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
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
                        {lcc.status === 'active' && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(lcc.id, 'inactive')}
                          >
                            Deactivate
                          </button>
                        )}
                        {lcc.status === 'inactive' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(lcc.id, 'active')}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleStatusChange(lcc.id, 'suspended')}
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
