"use client"
import { useState, useEffect } from "react"

interface LeaveRecord {
  id: string;
  staffId: string;
  staffName: string;
  position: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  rejectionReason?: string;
  appliedAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    staffId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const staff = [
    { id: 'staff1', name: 'Rev. John Doe', position: 'Pastor' },
    { id: 'staff2', name: 'Mary Johnson', position: 'Secretary' },
    { id: 'staff3', name: 'David Wilson', position: 'Treasurer' }
  ]

  const leaveTypes = [
    'Annual Leave', 'Sick Leave', 'Maternity Leave', 'Paternity Leave',
    'Study Leave', 'Emergency Leave', 'Bereavement Leave', 'Other'
  ]

  // Mock data
  useEffect(() => {
    setLeaves([
      {
        id: 'leave1',
        staffId: 'staff1',
        staffName: 'Rev. John Doe',
        position: 'Pastor',
        leaveType: 'Annual Leave',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        daysRequested: 15,
        reason: 'Family vacation and rest',
        status: 'pending',
        appliedAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'leave2',
        staffId: 'staff2',
        staffName: 'Mary Johnson',
        position: 'Secretary',
        leaveType: 'Sick Leave',
        startDate: '2024-01-20',
        endDate: '2024-01-25',
        daysRequested: 5,
        reason: 'Medical treatment and recovery',
        status: 'approved',
        approvedBy: 'admin1',
        approvedByName: 'Admin User',
        appliedAt: '2024-01-18T14:20:00Z',
        processedAt: '2024-01-19T09:15:00Z',
        createdAt: '2024-01-18T14:20:00Z',
        updatedAt: '2024-01-19T09:15:00Z'
      }
    ])
    setLoading(false)
  }, [])

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const selectedStaff = staff.find(s => s.id === formData.staffId)
      const daysRequested = calculateDays(formData.startDate, formData.endDate)

      if (editingId) {
        // Update existing leave
        setLeaves(prev => prev.map(l => 
          l.id === editingId 
            ? { 
                ...l, 
                ...formData, 
                staffName: selectedStaff?.name || '',
                position: selectedStaff?.position || '',
                daysRequested,
                updatedAt: new Date().toISOString() 
              }
            : l
        ))
      } else {
        // Create new leave
        const newLeave: LeaveRecord = {
          id: `leave_${Date.now()}`,
          staffId: formData.staffId,
          staffName: selectedStaff?.name || '',
          position: selectedStaff?.position || '',
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          daysRequested,
          reason: formData.reason,
          status: 'pending',
          appliedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setLeaves(prev => [...prev, newLeave])
      }
      
      setFormData({
        staffId: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      setError('Failed to save leave application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (leave: LeaveRecord) => {
    setFormData({
      staffId: leave.staffId,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason
    })
    setEditingId(leave.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this leave application?')) {
      setLeaves(prev => prev.filter(l => l.id !== id))
    }
  }

  const handleApprove = (id: string) => {
    setLeaves(prev => prev.map(l => 
      l.id === id 
        ? { 
            ...l, 
            status: 'approved' as const,
            approvedBy: 'current_admin',
            approvedByName: 'Current Admin',
            processedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString() 
          }
        : l
    ))
  }

  const handleReject = (id: string) => {
    if (rejectionReason.trim()) {
      setLeaves(prev => prev.map(l => 
        l.id === id 
          ? { 
              ...l, 
              status: 'rejected' as const,
              rejectionReason: rejectionReason,
              processedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString() 
            }
          : l
      ))
      setRejectionReason('')
      setRejectingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'var(--success)'
      case 'pending': return 'var(--warning)'
      case 'rejected': return 'var(--danger)'
      default: return 'var(--muted)'
    }
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Leave Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading leave applications...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Leave Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Apply for Leave'}
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
            {editingId ? 'Edit Leave Application' : 'Apply for Leave'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="staffId">Staff Member *</label>
                <select
                  id="staffId"
                  value={formData.staffId}
                  onChange={(e) => setFormData(prev => ({...prev, staffId: e.target.value}))}
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.position}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="leaveType">Leave Type *</label>
                <select
                  id="leaveType"
                  value={formData.leaveType}
                  onChange={(e) => setFormData(prev => ({...prev, leaveType: e.target.value}))}
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: 'var(--radius-input)',
              border: '1px solid var(--line)'
            }}>
              <label style={{fontWeight: 'bold', marginBottom: '0.5rem', display: 'block'}}>
                Days Requested: {calculateDays(formData.startDate, formData.endDate)} days
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Leave *</label>
              <textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
                required
                placeholder="Explain the reason for your leave"
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
                    staffId: '',
                    leaveType: '',
                    startDate: '',
                    endDate: '',
                    reason: ''
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
                {submitting ? 'Submitting...' : (editingId ? 'Update Application' : 'Submit Application')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Leave Applications ({leaves.length})</h3>
        
        {leaves.length === 0 ? (
          <p>No leave applications found. Apply for one using the form above.</p>
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
                  <th>Status</th>
                  <th>Applied At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <strong>{leave.staffName}</strong>
                      <div style={{fontSize: '12px', color: 'var(--muted)'}}>
                        {leave.position}
                      </div>
                    </td>
                    <td>{leave.leaveType}</td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td><strong>{leave.daysRequested}</strong></td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(leave.status),
                          color: 'white'
                        }}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td>{new Date(leave.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(leave)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(leave.id)}
                        >
                          Delete
                        </button>
                        {leave.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprove(leave.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setRejectingId(leave.id)}
                            >
                              Reject
                            </button>
                          </>
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

      {/* Rejection Modal */}
      {rejectingId && (
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
            <h3 style={{marginBottom: '1rem'}}>Reject Leave Application</h3>
            <div className="form-group">
              <label htmlFor="rejectionReason">Reason for Rejection</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
                rows={4}
                style={{width: '100%'}}
                required
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setRejectingId(null)
                  setRejectionReason('')
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleReject(rejectingId)}
                disabled={!rejectionReason.trim()}
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
