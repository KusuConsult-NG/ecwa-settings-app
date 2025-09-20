"use client"
import { useState, useEffect } from "react"
import { PayrollRecord, formatCurrency, getStatusColor, getStatusIcon, calculateNetSalary, PAYROLL_STATUSES } from '@/lib/payroll'
import { StaffRecord } from '@/lib/staff'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    staffId: '',
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    payPeriod: '',
    payDate: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    month: '',
    search: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [payrollRes, staffRes] = await Promise.all([
        fetch('/api/payroll'),
        fetch('/api/staff/list')
      ])

      if (payrollRes.ok) {
        const payrollData = await payrollRes.json()
        setPayroll(payrollData.payroll || [])
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
      const response = await fetch('/api/payroll', {
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
        setError(data.error || 'Failed to save payroll record')
      }
    } catch (err) {
      setError('Failed to save payroll record')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      staffId: '',
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      payPeriod: '',
      payDate: ''
    })
    setEditingId(null)
  }

  const handleEdit = (record: PayrollRecord) => {
    setFormData({
      staffId: record.staffId,
      basicSalary: record.basicSalary,
      allowances: record.allowances,
      deductions: record.deductions,
      payPeriod: record.payPeriod,
      payDate: record.payDate
    })
    setEditingId(record.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payroll record?')) {
      try {
        const response = await fetch(`/api/payroll/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadData()
        } else {
          setError('Failed to delete payroll record')
        }
      } catch (err) {
        setError('Failed to delete payroll record')
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/payroll/${id}/status`, {
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

  const filteredPayroll = payroll.filter(record => {
    if (filters.status && record.status !== filters.status) return false
    if (filters.month && !record.payPeriod.includes(filters.month)) return false
    if (filters.search && !getStaffName(record.staffId).toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading payroll data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Payroll Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Payroll Record
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
              {PAYROLL_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Month</label>
            <input
              type="month"
              value={filters.month}
              onChange={(e) => setFilters({...filters, month: e.target.value})}
            />
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
            {editingId ? 'Edit Payroll Record' : 'Add New Payroll Record'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Staff Member *</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => {
                    const selectedStaff = staff.find(s => s.id === e.target.value)
                    setFormData({
                      ...formData, 
                      staffId: e.target.value,
                      basicSalary: selectedStaff?.salary || 0
                    })
                  }}
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>{member.name} - {member.position}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Pay Period *</label>
                <input
                  type="month"
                  value={formData.payPeriod}
                  onChange={(e) => setFormData({...formData, payPeriod: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pay Date *</label>
                <input
                  type="date"
                  value={formData.payDate}
                  onChange={(e) => setFormData({...formData, payDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Basic Salary *</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({...formData, basicSalary: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Allowances</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({...formData, allowances: Number(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Deductions</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({...formData, deductions: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Net Salary (Calculated)</label>
              <input
                type="text"
                value={formatCurrency(calculateNetSalary(formData.basicSalary, formData.allowances, formData.deductions))}
                readOnly
                style={{backgroundColor: 'var(--surface)'}}
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

      {/* Payroll List */}
      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>
          Payroll Records ({filteredPayroll.length})
        </h3>
        
        {filteredPayroll.length === 0 ? (
          <p>No payroll records found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Pay Period</th>
                  <th>Pay Date</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayroll.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div>
                        <strong>{getStaffName(record.staffId)}</strong>
                        <br />
                        <small style={{color: 'var(--muted)'}}>{record.staffPosition}</small>
                      </div>
                    </td>
                    <td>{record.payPeriod}</td>
                    <td>{new Date(record.payDate).toLocaleDateString()}</td>
                    <td>{formatCurrency(record.basicSalary)}</td>
                    <td>{formatCurrency(record.allowances)}</td>
                    <td>{formatCurrency(record.deductions)}</td>
                    <td><strong>{formatCurrency(record.netSalary)}</strong></td>
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
                          {PAYROLL_STATUSES.map(status => (
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