"use client"
import { useState, useEffect } from "react"

interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    other: number;
  };
  deductions: {
    tax: number;
    pension: number;
    loan: number;
    other: number;
  };
  overtime: number;
  bonus: number;
  netSalary: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paymentMethod: 'bank_transfer' | 'cash' | 'cheque';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    staffId: '',
    month: '',
    year: new Date().getFullYear(),
    basicSalary: 0,
    allowances: {
      housing: 0,
      transport: 0,
      medical: 0,
      other: 0
    },
    deductions: {
      tax: 0,
      pension: 0,
      loan: 0,
      other: 0
    },
    overtime: 0,
    bonus: 0,
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'cash' | 'cheque',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  // Fetch data from APIs
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch staff and payroll in parallel
      const [staffResponse, payrollResponse] = await Promise.all([
        fetch('/api/staff/list'),
        fetch('/api/payroll')
      ])

      const [staffData, payrollData] = await Promise.all([
        staffResponse.json(),
        payrollResponse.json()
      ])

      if (staffResponse.ok) {
        setStaff(staffData.staff || [])
      }

      if (payrollResponse.ok) {
        setPayrolls(payrollData.payroll || [])
      } else {
        setError(payrollData.error || 'Failed to fetch payroll data')
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
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh payroll list
        await fetchData()
        
        // Reset form
        setFormData({
          staffId: '',
          month: '',
          year: new Date().getFullYear(),
          basicSalary: 0,
          allowances: {
            housing: 0,
            transport: 0,
            medical: 0,
            other: 0
          },
          deductions: {
            tax: 0,
            pension: 0,
            loan: 0,
            other: 0
          },
          overtime: 0,
          bonus: 0,
          paymentMethod: 'bank_transfer',
          notes: ''
        })
        setShowForm(false)
        setEditingId(null)
      } else {
        setError(data.error || 'Failed to save payroll record')
      }
    } catch (error) {
      setError('Failed to save payroll record')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'pending' | 'approved' | 'paid' | 'rejected') => {
    try {
      const response = await fetch(`/api/payroll/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh payroll list
        await fetchData()
      } else {
        setError(data.error || 'Failed to update payroll status')
      }
    } catch (error) {
      setError('Failed to update payroll status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--warning)'
      case 'approved': return 'var(--info)'
      case 'paid': return 'var(--success)'
      case 'rejected': return 'var(--danger)'
      default: return 'var(--muted)'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const calculateNetSalary = () => {
    const totalAllowances = formData.allowances.housing + formData.allowances.transport + 
                           formData.allowances.medical + formData.allowances.other
    const totalDeductions = formData.deductions.tax + formData.deductions.pension + 
                           formData.deductions.loan + formData.deductions.other
    return formData.basicSalary + totalAllowances + formData.overtime + formData.bonus - totalDeductions
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading payroll data...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Payroll Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Payroll Record'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="card">
          <h2>{editingId ? 'Edit Payroll Record' : 'Add New Payroll Record'}</h2>
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
                <label>Month *</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  required
                >
                  <option value="">Select month</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min="2020"
                  max="2030"
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
                  onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Overtime</label>
                <input
                  type="number"
                  value={formData.overtime}
                  onChange={(e) => setFormData({ ...formData, overtime: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Bonus</label>
                <input
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Housing Allowance</label>
                <input
                  type="number"
                  value={formData.allowances.housing}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    allowances: { ...formData.allowances, housing: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Transport Allowance</label>
                <input
                  type="number"
                  value={formData.allowances.transport}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    allowances: { ...formData.allowances, transport: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Medical Allowance</label>
                <input
                  type="number"
                  value={formData.allowances.medical}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    allowances: { ...formData.allowances, medical: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Other Allowance</label>
                <input
                  type="number"
                  value={formData.allowances.other}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    allowances: { ...formData.allowances, other: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tax Deduction</label>
                <input
                  type="number"
                  value={formData.deductions.tax}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    deductions: { ...formData.deductions, tax: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Pension Deduction</label>
                <input
                  type="number"
                  value={formData.deductions.pension}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    deductions: { ...formData.deductions, pension: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Loan Deduction</label>
                <input
                  type="number"
                  value={formData.deductions.loan}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    deductions: { ...formData.deductions, loan: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Other Deduction</label>
                <input
                  type="number"
                  value={formData.deductions.other}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    deductions: { ...formData.deductions, other: Number(e.target.value) }
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="net-salary-display">
                <strong>Net Salary: {formatCurrency(calculateNetSalary())}</strong>
              </div>
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
                  setEditingId(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Payroll Records</h2>
        {payrolls.length === 0 ? (
          <div className="empty-state">
            <p>No payroll records found. Add a new record to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Month/Year</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map(payroll => {
                  const totalAllowances = payroll.allowances.housing + payroll.allowances.transport + 
                                        payroll.allowances.medical + payroll.allowances.other
                  const totalDeductions = payroll.deductions.tax + payroll.deductions.pension + 
                                        payroll.deductions.loan + payroll.deductions.other
                  
                  return (
                    <tr key={payroll.id}>
                      <td>
                        <div>
                          <strong>{payroll.staffName}</strong>
                          <br />
                          <small>{payroll.staffEmail}</small>
                        </div>
                      </td>
                      <td>
                        {months.find(m => m.value === payroll.month)?.label} {payroll.year}
                      </td>
                      <td>{formatCurrency(payroll.basicSalary)}</td>
                      <td>{formatCurrency(totalAllowances)}</td>
                      <td>{formatCurrency(totalDeductions)}</td>
                      <td><strong>{formatCurrency(payroll.netSalary)}</strong></td>
                      <td>
                        <span 
                          className="badge"
                          style={{ backgroundColor: getStatusColor(payroll.status) }}
                        >
                          {payroll.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{payroll.paymentMethod.replace('_', ' ').toUpperCase()}</td>
                      <td>
                        <div className="btn-group">
                          {payroll.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleStatusChange(payroll.id, 'approved')}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleStatusChange(payroll.id, 'rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {payroll.status === 'approved' && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleStatusChange(payroll.id, 'paid')}
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .net-salary-display {
          background: var(--background-secondary);
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
          font-size: 1.2rem;
          color: var(--primary);
          border: 2px solid var(--primary);
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