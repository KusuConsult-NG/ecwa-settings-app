"use client"
import { useState, useEffect } from "react"
import { BankAccount, formatCurrency, getStatusColor, getStatusIcon } from '@/lib/bank'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function BankPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
    accountType: 'current' as 'savings' | 'current' | 'fixed_deposit' | 'investment',
    currency: 'NGN',
    openingDate: '',
    branch: '',
    swiftCode: '',
    iban: '',
    currentBalance: 0,
    authorizedSignatories: [] as string[],
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    accountType: '',
    bankName: '',
    search: ''
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bank')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      } else {
        setError('Failed to load bank accounts')
      }
    } catch (err) {
      setError('Failed to load bank accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingId ? `/api/bank/${editingId}` : '/api/bank'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadAccounts()
        setShowForm(false)
        setFormData({
          accountName: '',
          accountNumber: '',
          bankName: '',
          bankCode: '',
          accountType: 'current',
          currency: 'NGN',
          openingDate: '',
          branch: '',
          swiftCode: '',
          iban: '',
          currentBalance: 0,
          authorizedSignatories: [],
          notes: ''
        })
        setEditingId(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save bank account')
      }
    } catch (err) {
      setError('Failed to save bank account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (account: BankAccount) => {
    setFormData({
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      bankCode: account.bankCode,
      accountType: account.accountType,
      currency: account.currency,
      openingDate: account.openingDate,
      branch: account.branch,
      swiftCode: account.swiftCode || '',
      iban: account.iban || '',
      currentBalance: account.currentBalance,
      authorizedSignatories: account.authorizedSignatories,
      notes: account.notes || ''
    })
    setEditingId(account.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      try {
        const response = await fetch(`/api/bank/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadAccounts()
        } else {
          setError('Failed to delete bank account')
        }
      } catch (err) {
        setError('Failed to delete bank account')
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/bank/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await loadAccounts()
      } else {
        setError('Failed to update status')
      }
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const filteredAccounts = accounts.filter(account => {
    if (filters.status && account.status !== filters.status) return false
    if (filters.accountType && account.accountType !== filters.accountType) return false
    if (filters.bankName && !account.bankName.toLowerCase().includes(filters.bankName.toLowerCase())) return false
    if (filters.search && !account.accountName.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading bank accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>Bank Account Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Bank Account
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select
              value={filters.accountType}
              onChange={(e) => setFilters({...filters, accountType: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
              <option value="fixed_deposit">Fixed Deposit</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              value={filters.bankName}
              onChange={(e) => setFilters({...filters, bankName: e.target.value})}
              placeholder="Filter by bank name"
            />
          </div>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by account name"
            />
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>
            {editingId ? 'Edit Bank Account' : 'Add New Bank Account'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Account Name *</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bank Code</label>
                <input
                  type="text"
                  value={formData.bankCode}
                  onChange={(e) => setFormData({...formData, bankCode: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Account Type *</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value as any})}
                  required
                >
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                  <option value="investment">Investment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Currency *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  required
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Opening Date *</label>
                <input
                  type="date"
                  value={formData.openingDate}
                  onChange={(e) => setFormData({...formData, openingDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>SWIFT Code</label>
                <input
                  type="text"
                  value={formData.swiftCode}
                  onChange={(e) => setFormData({...formData, swiftCode: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>IBAN</label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => setFormData({...formData, iban: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Current Balance *</label>
                <input
                  type="number"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({...formData, currentBalance: Number(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                  setEditingId(null)
                  setFormData({
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    bankCode: '',
                    accountType: 'current',
                    currency: 'NGN',
                    openingDate: '',
                    branch: '',
                    swiftCode: '',
                    iban: '',
                    currentBalance: 0,
                    authorizedSignatories: [],
                    notes: ''
                  })
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>
          Bank Accounts ({filteredAccounts.length})
        </h3>
        
        {filteredAccounts.length === 0 ? (
          <p>No bank accounts found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Account Number</th>
                  <th>Bank Name</th>
                  <th>Type</th>
                  <th>Currency</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.accountName}</td>
                    <td>{account.accountNumber}</td>
                    <td>{account.bankName}</td>
                    <td>{account.accountType}</td>
                    <td>{account.currency}</td>
                    <td>{formatCurrency(account.currentBalance, account.currency)}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(account.status),
                          color: 'white'
                        }}
                      >
                        {getStatusIcon(account.status)} {account.status}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(account)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(account.id)}
                        >
                          Delete
                        </button>
                        <select
                          value={account.status}
                          onChange={(e) => handleStatusChange(account.id, e.target.value)}
                          style={{fontSize: '12px', padding: '2px 4px'}}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="closed">Closed</option>
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