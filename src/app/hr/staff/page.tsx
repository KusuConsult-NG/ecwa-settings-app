"use client"
import { useState, useEffect } from "react"

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'terminated';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    department: '',
    salary: 0,
    startDate: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const positions = [
    'Pastor', 'Assistant Pastor', 'Secretary', 'Treasurer', 'Financial Secretary',
    'Youth Pastor', 'Children Pastor', 'Music Director', 'Choir Director',
    'Usher', 'Security', 'Cleaner', 'Driver', 'Administrator', 'Accountant'
  ]

  const departments = [
    'Ministry', 'Administration', 'Finance', 'Music', 'Youth', 'Children',
    'Women', 'Men', 'Security', 'Maintenance', 'Transportation'
  ]

  // Mock data
  useEffect(() => {
    setStaff([
      {
        id: 'staff1',
        name: 'Rev. John Doe',
        email: 'john.doe@ecwa.org',
        phone: '+234-801-234-5678',
        address: '123 Pastor Street, Jos, Plateau State',
        position: 'Pastor',
        department: 'Ministry',
        salary: 150000,
        startDate: '2020-01-15',
        status: 'active',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+234-802-345-6789',
          relationship: 'Spouse'
        },
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
        // Update existing staff
        setStaff(prev => prev.map(s => 
          s.id === editingId 
            ? { ...s, ...formData, updatedAt: new Date().toISOString() }
            : s
        ))
      } else {
        // Create new staff
        const newStaff: StaffRecord = {
          id: `staff_${Date.now()}`,
          ...formData,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setStaff(prev => [...prev, newStaff])
      }
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        position: '',
        department: '',
        salary: 0,
        startDate: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        }
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      setError('Failed to save staff member')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (staffMember: StaffRecord) => {
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      address: staffMember.address,
      position: staffMember.position,
      department: staffMember.department,
      salary: staffMember.salary,
      startDate: staffMember.startDate,
      emergencyContact: staffMember.emergencyContact
    })
    setEditingId(staffMember.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaff(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleStatusChange = (id: string, status: 'active' | 'inactive' | 'terminated') => {
    setStaff(prev => prev.map(s => 
      s.id === id 
        ? { ...s, status, updatedAt: new Date().toISOString() }
        : s
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success)'
      case 'inactive': return 'var(--muted)'
      case 'terminated': return 'var(--danger)'
      default: return 'var(--muted)'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Staff Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading staff...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Staff Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Staff'}
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
            {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                  placeholder="Enter full name"
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
                <label htmlFor="position">Position *</label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({...prev, position: e.target.value}))}
                  required
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="salary">Salary (₦)</label>
                <input
                  type="number"
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({...prev, salary: parseInt(e.target.value) || 0}))}
                  min="0"
                  placeholder="Enter salary amount"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                placeholder="Enter address"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
              />
            </div>

            <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>Emergency Contact</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyName">Contact Name</label>
                <input
                  type="text"
                  id="emergencyName"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                  }))}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyPhone">Contact Phone</label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                  }))}
                  placeholder="Enter emergency contact phone"
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyRelationship">Relationship</label>
                <input
                  type="text"
                  id="emergencyRelationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                  }))}
                  placeholder="e.g., Spouse, Parent, Sibling"
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
                    email: '',
                    phone: '',
                    address: '',
                    position: '',
                    department: '',
                    salary: 0,
                    startDate: '',
                    emergencyContact: {
                      name: '',
                      phone: '',
                      relationship: ''
                    }
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
                {submitting ? 'Saving...' : (editingId ? 'Update Staff' : 'Add Staff')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Staff List ({staff.length})</h3>
        
        {staff.length === 0 ? (
          <p>No staff found. Add one using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td><strong>{staffMember.name}</strong></td>
                    <td>{staffMember.position}</td>
                    <td>{staffMember.department}</td>
                    <td>{staffMember.email}</td>
                    <td>{staffMember.phone}</td>
                    <td>{formatCurrency(staffMember.salary)}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(staffMember.status),
                          color: 'white'
                        }}
                      >
                        {staffMember.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(staffMember)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(staffMember.id)}
                        >
                          Delete
                        </button>
                        {staffMember.status === 'active' && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(staffMember.id, 'inactive')}
                          >
                            Deactivate
                          </button>
                        )}
                        {staffMember.status === 'inactive' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(staffMember.id, 'active')}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleStatusChange(staffMember.id, 'terminated')}
                        >
                          Terminate
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
