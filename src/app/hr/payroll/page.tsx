"use client"
import { useState, useEffect } from "react"

interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  position: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: string;
  year: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentDate?: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'cheque';
  createdAt: string;
  updatedAt: string;
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    staffId: '',
    staffName: '',
    position: '',
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    month: '',
    year: new Date().getFullYear(),
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'cash' | 'cheque'
  })

  const staffOptions = [
    { id: 'staff1', name: 'Rev. John Doe', position: 'Pastor' },
    { id: 'staff2', name: 'Mary Johnson', position: 'Secretary' },
    { id: 'staff3', name: 'David Wilson', position: 'Treasurer' }
  ]

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    fetchPayrolls()
  }, [])

  const fetchPayrolls = async () => {
    try {
      setLoading(true)
      // Mock data - replace with API call
      const mockPayrolls: PayrollRecord[] = [
        {
          id: 'payroll1',
          staffId: 'staff1',
          staffName: 'Rev. John Doe',
          position: 'Pastor',
          basicSalary: 150000,
          allowances: 25000,
          deductions: 15000,
          netSalary: 160000,
          month: 'January',
          year: 2024,
          status: 'paid',
          paymentDate: '2024-01-31',
          paymentMethod: 'bank_transfer',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
      setPayrolls(mockPayrolls)
    } catch (err) {
      setError('Failed to fetch payrolls')
    } finally {
      setLoading(false)
    }
  }

  const calculateNetSalary = (basic: number, allowances: number, deductions: number) => {
    return basic + allowances - deductions
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedStaff = staffOptions.find(s => s.id === formData.staffId)
      const netSalary = calculateNetSalary(formData.basicSalary, formData.allowances, formData.deductions)
      
      if (editingId) {
        // Update existing payroll
        setPayrolls(prev => prev.map(p => 
          p.id === editingId 
            ? { 
                ...p, 
                ...formData, 
                staffName: selectedStaff?.name || '',
                position: selectedStaff?.position || '',
                netSalary,
                updatedAt: new Date().toISOString() 
              }
            : p
        ))
      } else {
        // Create new payroll
        const newPayroll: PayrollRecord = {
          id: `payroll_${Date.now()}`,
          ...formData,
          staffName: selectedStaff?.name || '',
          position: selectedStaff?.position || '',
          netSalary,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setPayrolls(prev => [...prev, newPayroll])
      }
      
      setShowForm(false)
      setEditingId(null)
      setFormData({
        staffId: '',
        staffName: '',
        position: '',
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        month: '',
        year: new Date().getFullYear(),
        paymentMethod: 'bank_transfer'
      })
    } catch (err) {
      setError('Failed to save payroll')
    }
  }

  const handleEdit = (payroll: PayrollRecord) => {
    setFormData({
      staffId: payroll.staffId,
      staffName: payroll.staffName,
      position: payroll.position,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      month: payroll.month,
      year: payroll.year,
      paymentMethod: payroll.paymentMethod
    })
    setEditingId(payroll.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payroll record?')) {
      setPayrolls(prev => prev.filter(p => p.id !== id))
    }
  }

  const handleStatusChange = (id: string, status: 'pending' | 'paid' | 'cancelled') => {
    setPayrolls(prev => prev.map(p => 
      p.id === id 
        ? { 
            ...p, 
            status, 
            paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
            updatedAt: new Date().toISOString() 
          }
        : p
    ))
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Payroll Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading payrolls...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Payroll Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add Payroll
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
            {editingId ? 'Edit Payroll' : 'Add New Payroll'}
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
                <label htmlFor="month">Month *</label>
                <select
                  id="month"
                  value={formData.month}
                  onChange={(e) => setFormData(prev => ({...prev, month: e.target.value}))}
                  required
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  type="number"
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({...prev, year: parseInt(e.target.value)}))}
                  min="2020"
                  max="2030"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method *</label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({...prev, paymentMethod: e.target.value as any}))}
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="basicSalary">Basic Salary (₦) *</label>
                <input
                  type="number"
                  id="basicSalary"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData(prev => ({...prev, basicSalary: parseInt(e.target.value) || 0}))}
                  min="0"
                  required
                  placeholder="Enter basic salary"
                />
              </div>
              <div className="form-group">
                <label htmlFor="allowances">Allowances (₦)</label>
                <input
                  type="number"
                  id="allowances"
                  value={formData.allowances}
                  onChange={(e) => setFormData(prev => ({...prev, allowances: parseInt(e.target.value) || 0}))}
                  min="0"
                  placeholder="Enter allowances"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deductions">Deductions (₦)</label>
              <input
                type="number"
                id="deductions"
                value={formData.deductions}
                onChange={(e) => setFormData(prev => ({...prev, deductions: parseInt(e.target.value) || 0}))}
                min="0"
                placeholder="Enter deductions"
              />
            </div>

            <div className="form-group" style={{padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
              <label>Net Salary (₦)</label>
              <div style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)'}}>
                ₦{calculateNetSalary(formData.basicSalary, formData.allowances, formData.deductions).toLocaleString()}
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
                    staffId: '',
                    staffName: '',
                    position: '',
                    basicSalary: 0,
                    allowances: 0,
                    deductions: 0,
                    month: '',
                    year: new Date().getFullYear(),
                    paymentMethod: 'bank_transfer'
                  })
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Payroll' : 'Add Payroll'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Payroll List ({payrolls.length})</h3>
        
        {payrolls.length === 0 ? (
          <p>No payroll records found. Add one using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Position</th>
                  <th>Month/Year</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    <td><strong>{payroll.staffName}</strong></td>
                    <td>{payroll.position}</td>
                    <td>{payroll.month} {payroll.year}</td>
                    <td>₦{payroll.basicSalary.toLocaleString()}</td>
                    <td>₦{payroll.allowances.toLocaleString()}</td>
                    <td>₦{payroll.deductions.toLocaleString()}</td>
                    <td><strong>₦{payroll.netSalary.toLocaleString()}</strong></td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: payroll.status === 'paid' ? 'var(--success)' : 
                                          payroll.status === 'pending' ? 'var(--warning)' : 'var(--danger)',
                          color: 'white'
                        }}
                      >
                        {payroll.status}
                      </span>
                    </td>
                    <td>{payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(payroll)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(payroll.id)}
                        >
                          Delete
                        </button>
                        {payroll.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(payroll.id, 'paid')}
                          >
                            Mark Paid
                          </button>
                        )}
                        {payroll.status === 'paid' && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(payroll.id, 'pending')}
                          >
                            Mark Pending
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleStatusChange(payroll.id, 'cancelled')}
                        >
                          Cancel
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
