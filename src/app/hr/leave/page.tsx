"use client"
import { useState, useEffect } from "react"

interface LeaveRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid' | 'study';
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedByName?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
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

interface LeaveBalance {
  staffId: string;
  staffName: string;
  staffEmail: string;
  entitlements: { [key: string]: number };
  used: { [key: string]: number };
  balance: { [key: string]: number };
}

export default function LeavePage() {
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showBalance, setShowBalance] = useState(false)
  const [formData, setFormData] = useState({
    staffId: '',
    leaveType: 'annual' as 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid' | 'study',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    year: new Date().getFullYear().toString()
  })

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'study', label: 'Study Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' }
  ]

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
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
      if (filters.leaveType) params.append('leaveType', filters.leaveType)
      if (filters.year) params.append('year', filters.year)

      // Fetch data in parallel
      const [staffResponse, leaveResponse, balanceResponse] = await Promise.all([
        fetch('/api/staff/list'),
        fetch(`/api/leave?${params.toString()}`),
        fetch(`/api/leave/balance?year=${filters.year}`)
      ])

      const [staffData, leaveData, balanceData] = await Promise.all([
        staffResponse.json(),
        leaveResponse.json(),
        balanceResponse.json()
      ])

      if (staffResponse.ok) {
        setStaff(staffData.staff || [])
      }

      if (leaveResponse.ok) {
        setLeaveRecords(leaveData.leaveRecords || [])
      } else {
        setError(leaveData.error || 'Failed to fetch leave data')
      }

      if (balanceResponse.ok) {
        setLeaveBalances(balanceData.staffBalances || [])
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
      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh leave records
        await fetchData()
        
        // Reset form
        setFormData({
          staffId: '',
          leaveType: 'annual',
          startDate: '',
          endDate: '',
          reason: ''
        })
        setShowForm(false)
        setEditingId(null)
      } else {
        setError(data.error || 'Failed to submit leave request')
      }
    } catch (error) {
      setError('Failed to submit leave request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      const response = await fetch(`/api/leave/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh leave records
        await fetchData()
      } else {
        setError(data.error || 'Failed to update leave status')
      }
    } catch (error) {
      setError('Failed to update leave status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--warning)'
      case 'approved': return 'var(--success)'
      case 'rejected': return 'var(--danger)'
      case 'cancelled': return 'var(--muted)'
      default: return 'var(--muted)'
    }
  }

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case 'annual': return 'var(--primary)'
      case 'sick': return 'var(--danger)'
      case 'maternity': return 'var(--info)'
      case 'paternity': return 'var(--info)'
      case 'emergency': return 'var(--warning)'
      case 'study': return 'var(--success)'
      case 'unpaid': return 'var(--muted)'
      default: return 'var(--muted)'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const timeDiff = end.getTime() - start.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading leave data...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Leave Management</h1>
        <div className="btn-group">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Request Leave'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? 'Hide Balance' : 'View Leave Balance'}
          </button>
        </div>
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
            <label>Leave Type</label>
            <select
              value={filters.leaveType}
              onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
            >
              <option value="">All Types</option>
              {leaveTypes.map(lt => (
                <option key={lt.value} value={lt.value}>{lt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            >
              {[2022, 2023, 2024, 2025].map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      {showBalance && (
        <div className="card">
          <h2>Leave Balance - {filters.year}</h2>
          {leaveBalances.length === 0 ? (
            <div className="empty-state">
              <p>No leave balance data available.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Annual</th>
                    <th>Sick</th>
                    <th>Maternity</th>
                    <th>Paternity</th>
                    <th>Emergency</th>
                    <th>Study</th>
                    <th>Unpaid</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveBalances.map(balance => (
                    <tr key={balance.staffId}>
                      <td>
                        <div>
                          <strong>{balance.staffName}</strong>
                          <br />
                          <small>{balance.staffEmail}</small>
                        </div>
                      </td>
                      <td>
                        <span className="balance-display">
                          {balance.balance.annual}/{balance.entitlements.annual}
                        </span>
                      </td>
                      <td>
                        <span className="balance-display">
                          {balance.balance.sick}/{balance.entitlements.sick}
                        </span>
                      </td>
                      <td>
                        <span className="balance-display">
                          {balance.balance.maternity}/{balance.entitlements.maternity}
                        </span>
                      </td>
                      <td>
                        <span className="balance-display">
                          {balance.balance.paternity}/{balance.entitlements.paternity}
                        </span>
                      </td>
                      <td>
                        <span className="balance-display">
                          {balance.balance.emergency}/{balance.entitlements.emergency}
                        </span>
                      </td>
                      <td>
                        <span className="balance-display">
                          {balance.balance.study}/{balance.entitlements.study}
                        </span>
                      </td>
                      <td>
                        <span className="balance-display">
                          {balance.used.unpaid} days used
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Leave Request Form */}
      {showForm && (
        <div className="card">
          <h2>Request Leave</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Staff Member *</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  required
                >
                  <option value="">Select staff member</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.position}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                  required
                >
                  {leaveTypes.map(lt => (
                    <option key={lt.value} value={lt.value}>
                      {lt.label}
                    </option>
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
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                placeholder="Please provide a detailed reason for your leave request..."
                required
              />
            </div>

            {formData.startDate && formData.endDate && (
              <div className="form-group">
                <div className="days-display">
                  <strong>Days Requested: {calculateDays(formData.startDate, formData.endDate)} days</strong>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
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

      {/* Leave Records */}
      <div className="card">
        <h2>Leave Records</h2>
        {leaveRecords.length === 0 ? (
          <div className="empty-state">
            <p>No leave records found. Submit a leave request to get started.</p>
          </div>
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
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRecords.map(record => (
                  <tr key={record.id}>
                    <td>
                      <div>
                        <strong>{record.staffName}</strong>
                        <br />
                        <small>{record.staffEmail}</small>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ backgroundColor: getLeaveTypeColor(record.leaveType) }}
                      >
                        {leaveTypes.find(lt => lt.value === record.leaveType)?.label}
                      </span>
                    </td>
                    <td>{formatDate(record.startDate)}</td>
                    <td>{formatDate(record.endDate)}</td>
                    <td><strong>{record.daysRequested}</strong></td>
                    <td>
                      <span 
                        className="badge"
                        style={{ backgroundColor: getStatusColor(record.status) }}
                      >
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="reason-cell">
                        {record.reason}
                        {record.rejectionReason && (
                          <div className="rejection-reason">
                            <strong>Rejection Reason:</strong> {record.rejectionReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="btn-group">
                        {record.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleStatusChange(record.id, 'approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                const reason = prompt('Enter rejection reason:')
                                if (reason) {
                                  handleStatusChange(record.id, 'rejected', reason)
                                }
                              }}
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

      <style jsx>{`
        .balance-display {
          font-weight: bold;
          color: var(--text);
        }
        
        .days-display {
          background: var(--background-secondary);
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
          font-size: 1.1rem;
          color: var(--primary);
          border: 2px solid var(--primary);
        }
        
        .reason-cell {
          max-width: 200px;
          word-wrap: break-word;
        }
        
        .rejection-reason {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: var(--danger-light);
          border-radius: 0.25rem;
          font-size: 0.9rem;
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