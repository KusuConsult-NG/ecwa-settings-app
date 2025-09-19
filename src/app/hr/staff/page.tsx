"use client"
import { useState, useEffect } from "react"
import { StaffRecord, formatCurrency, getStatusColor, getStatusIcon, STAFF_POSITIONS, STAFF_DEPARTMENTS, STAFF_STATUSES } from '@/lib/staff'

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: 0,
    hireDate: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    qualifications: '',
    previousExperience: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    position: '',
    search: ''
  })

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data.staff || [])
      } else {
        setError('Failed to load staff')
      }
    } catch (err) {
      setError('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadStaff()
        setShowForm(false)
        resetForm()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save staff member')
      }
    } catch (err) {
      setError('Failed to save staff member')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: 0,
      hireDate: '',
      address: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      qualifications: '',
      previousExperience: ''
    })
    setEditingId(null)
  }

  const handleEdit = (staffMember: StaffRecord) => {
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      position: staffMember.position,
      department: staffMember.department,
      salary: staffMember.salary,
      hireDate: staffMember.hireDate,
      address: staffMember.address,
      emergencyContact: staffMember.emergencyContact,
      qualifications: staffMember.qualifications,
      previousExperience: staffMember.previousExperience
    })
    setEditingId(staffMember.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        const response = await fetch(`/api/staff/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadStaff()
        } else {
          setError('Failed to delete staff member')
        }
      } catch (err) {
        setError('Failed to delete staff member')
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/staff/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await loadStaff()
      } else {
        setError('Failed to update status')
      }
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const filteredStaff = staff.filter(member => {
    if (filters.status && member.status !== filters.status) return false
    if (filters.department && member.department !== filters.department) return false
    if (filters.position && member.position !== filters.position) return false
    if (filters.search && !member.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading staff...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Staff Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Staff Member
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
              {STAFF_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
            >
              <option value="">All Departments</option>
              {STAFF_DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Position</label>
            <select
              value={filters.position}
              onChange={(e) => setFilters({...filters, position: e.target.value})}
            >
              <option value="">All Positions</option>
              {STAFF_POSITIONS.map(position => (
                <option key={position} value={position}>{position}</option>
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
            {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Position *</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  required
                >
                  <option value="">Select Position</option>
                  {STAFF_POSITIONS.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  {STAFF_DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Salary *</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hire Date *</label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
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

            <h4>Emergency Contact</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Name *</label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData({
                    ...formData, 
                    emergencyContact: {...formData.emergencyContact, name: e.target.value}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Phone *</label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData({
                    ...formData, 
                    emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Relationship *</label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData({
                    ...formData, 
                    emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                  })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Qualifications</label>
              <textarea
                value={formData.qualifications}
                onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Previous Experience</label>
              <textarea
                value={formData.previousExperience}
                onChange={(e) => setFormData({...formData, previousExperience: e.target.value})}
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

      {/* Staff List */}
      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>
          Staff Members ({filteredStaff.length})
        </h3>
        
        {filteredStaff.length === 0 ? (
          <p>No staff members found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div>
                        <strong>{member.name}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>Hired: {new Date(member.hireDate).toLocaleDateString()}</small>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>{member.position}</td>
                    <td>{member.department}</td>
                    <td>{formatCurrency(member.salary)}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(member.status),
                          color: 'white'
                        }}
                      >
                        {getStatusIcon(member.status)} {member.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(member)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(member.id)}
                        >
                          Delete
                        </button>
                        <select
                          value={member.status}
                          onChange={(e) => handleStatusChange(member.id, e.target.value)}
                          style={{fontSize: '12px', padding: '2px 4px'}}
                        >
                          {STAFF_STATUSES.map(status => (
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