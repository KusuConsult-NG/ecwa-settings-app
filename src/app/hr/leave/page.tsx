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
  approvedAt?: string;
  rejectionReason?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    staffId: '',
    staffName: '',
    position: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  })

  const leaveTypes = [
    'Annual Leave', 'Sick Leave', 'Maternity Leave', 'Paternity Leave',
    'Study Leave', 'Emergency Leave', 'Personal Leave', 'Other'
  ]

  const staffOptions = [
    { id: 'staff1', name: 'Rev. John Doe', position: 'Pastor' },
    { id: 'staff2', name: 'Mary Johnson', position: 'Secretary' },
    { id: 'staff3', name: 'David Wilson', position: 'Treasurer' }
  ]

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      // Mock data - replace with API call
      const mockLeaves: LeaveRecord[] = [
        {
          id: 'leave1',
          staffId: 'staff1',
          staffName: 'Rev. John Doe',
          position: 'Pastor',
          leaveType: 'Annual Leave',
          startDate: '2024-02-01',
          endDate: '2024-02-14',
          daysRequested: 14,
          reason: 'Family vacation',
          status: 'pending',
          submittedAt: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
      setLeaves(mockLeaves)
    } catch (err) {
      setError('Failed to fetch leaves')
    } finally {
      setLoading(false)
    }
  }

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
    try {
      const selectedStaff = staffOptions.find(s => s.id === formData.staffId)
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
          ...formData,
          staffName: selectedStaff?.name || '',
          position: selectedStaff?.position || '',
          daysRequested,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setLeaves(prev => [...prev, newLeave])
      }
      
      setShowForm(false)
      setEditingId(null)
      setFormData({
        staffId: '',
        staffName: '',
        position: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      })
    } catch (err) {
      setError('Failed to save leave')
    }
  }

  const handleEdit = (leave: LeaveRecord) => {
    setFormData({
      staffId: leave.staffId,
      staffName: leave.staffName,
      position: leave.position,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason
    })
    setEditingId(leave.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      setLeaves(prev => prev.filter(l => l.id !== id))
    }
  }

  const handleApprove = (id: string) => {
    setLeaves(prev => prev.map(l => 
      l.id === id 
        ? { 
            ...l, 
            status: 'approved' as const,
            approvedBy: 'current_user',
            approvedByName: 'Current User',
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString() 
          }
        : l
    ))
  }

  const handleReject = (id: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      setLeaves(prev => prev.map(l => 
        l.id === id 
          ? { 
              ...l, 
              status: 'rejected' as const,
              rejectionReason: reason,
              updatedAt: new Date().toISOString() 
            }
          : l
      ))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--warning)'
      case 'approved': return 'var(--success)'
      case 'rejected': return 'var(--danger)'
      default: return 'var(--muted)'
    }
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Leave Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading leaves...</p>
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
          onClick={() => setShowForm(true)}
        >
          + Add Leave Request
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
            {editingId ? 'Edit Leave Request' : 'Add New Leave Request'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="staffId">Staff Member *</label>
                <select
                  id="staffId"
                  value={formData.staffId}
                  onChange={(e) => {
                    const selectedStaff = staffOptions.find(s => s.id === e.target.value)
                    setFormData(prev => ({
                      ...prev,
                      staffId: e.target.value,
                      staffName: selectedStaff?.name || '',
                      position: selectedStaff?.position || ''
                    }))
                  }}
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staffOptions.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name} - {staff.position}</option>
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

            <div className="form-group" style={{padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
              <label>Days Requested</label>
              <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)'}}>
                {calculateDays(formData.startDate, formData.endDate)} days
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason *</label>
              <textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
                required
                placeholder="Enter reason for leave"
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
                    staffName: '',
                    position: '',
                    leaveType: '',
                    startDate: '',
                    endDate: '',
                    reason: ''
                  })
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Leave' : 'Add Leave Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Leave Requests ({leaves.length})</h3>
        
        {leaves.length === 0 ? (
          <p>No leave requests found. Add one using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Position</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td><strong>{leave.staffName}</strong></td>
                    <td>{leave.position}</td>
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
                    <td>{leave.reason}</td>
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
                              onClick={() => handleReject(leave.id)}
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
    </section>
  )
}
