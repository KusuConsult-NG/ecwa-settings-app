"use client"
import { useState, useEffect } from "react"
import { LeaveRecord, getStatusColor, getStatusIcon, getTypeColor, calculateLeaveDays, LEAVE_TYPES, LEAVE_STATUSES } from '@/lib/leave'
import { StaffRecord } from '@/lib/staff'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function LeavePage() {
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    staffId: '',
    leaveType: 'annual' as 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'study' | 'other',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [leaveRes, staffRes] = await Promise.all([
        fetch('/api/leave'),
        fetch('/api/staff/list')
      ])

      if (leaveRes.ok) {
        const leaveData = await leaveRes.json()
        setLeaveRecords(leaveData.leave || [])
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
      const response = await fetch('/api/leave', {
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
        setError(data.error || 'Failed to save leave request')
      }
    } catch (err) {
      setError('Failed to save leave request')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      staffId: '',
      leaveType: 'annual',
      startDate: '',
      endDate: '',
      reason: ''
    })
    setEditingId(null)
  }

  const handleEdit = (record: LeaveRecord) => {
    setFormData({
      staffId: record.staffId,
      leaveType: record.leaveType,
      startDate: record.startDate,
      endDate: record.endDate,
      reason: record.reason
    })
    setEditingId(record.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      try {
        const response = await fetch(`/api/leave/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadData()
        } else {
          setError('Failed to delete leave request')
        }
      } catch (err) {
        setError('Failed to delete leave request')
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/leave/${id}/status`, {
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

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId)
    return staffMember ? staffMember.name : 'Unknown'
  }

  const filteredLeave = leaveRecords.filter(record => {
    if (filters.status && record.status !== filters.status) return false
    if (filters.leaveType && record.leaveType !== filters.leaveType) return false
    if (filters.search && !getStaffName(record.staffId).toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading leave data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Leave Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Request Leave
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
              {LEAVE_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Leave Type</label>
            <select
              value={filters.leaveType}
              onChange={(e) => setFilters({...filters, leaveType: e.target.value})}
            >
              <option value="">All Types</option>
              {LEAVE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by staff name"
            />
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>
            {editingId ? 'Edit Leave Request' : 'Request Leave'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Staff Member *</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>{member.name} - {member.position}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value as any})}
                  required
                >
                  {LEAVE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Days Requested (Calculated)</label>
              <input
                type="text"
                value={formData.startDate && formData.endDate ? 
                  calculateLeaveDays(formData.startDate, formData.endDate) + ' days' : 
                  'Select dates to calculate'
                }
                readOnly
                style={{backgroundColor: 'var(--surface)'}}
              />
            </div>

            <div className="form-group">
              <label>Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : (editingId ? 'Update' : 'Request Leave')}
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

      {/* Leave List */}
      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>
          Leave Requests ({filteredLeave.length})
        </h3>
        
        {filteredLeave.length === 0 ? (
          <p>No leave requests found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeave.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div>
                        <strong>{getStaffName(record.staffId)}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{record.staffEmail}</small>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getTypeColor(record.leaveType),
                          color: 'white'
                        }}
                      >
                        {record.leaveType}
                      </span>
                    </td>
                    <td>{new Date(record.startDate).toLocaleDateString()}</td>
                    <td>{new Date(record.endDate).toLocaleDateString()}</td>
                    <td>{record.daysRequested} days</td>
                    <td>{record.reason}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(record.status),
                          color: 'white'
                        }}
                      >
                        {getStatusIcon(record.status)} {record.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(record.id)}
                        >
                          Delete
                        </button>
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusChange(record.id, e.target.value)}
                          style={{fontSize: '12px', padding: '2px 4px'}}
                        >
                          {LEAVE_STATUSES.map(status => (
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