"use client"
import { useState, useEffect } from "react"

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountType: 'savings' | 'current' | 'fixed_deposit' | 'investment';
  currency: string;
  openingDate: string;
  branch: string;
  swiftCode?: string;
  iban?: string;
  currentBalance: number;
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  authorizedSignatories: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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

  const accountTypes = [
    { value: 'savings', label: 'Savings Account' },
    { value: 'current', label: 'Current Account' },
    { value: 'fixed_deposit', label: 'Fixed Deposit' },
    { value: 'investment', label: 'Investment Account' }
  ]

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'closed', label: 'Closed' }
  ]

  const currencies = ['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']

  const nigerianBanks = [
    'Access Bank', 'Citibank Nigeria', 'Ecobank Nigeria', 'Fidelity Bank',
    'First Bank of Nigeria', 'First City Monument Bank', 'Globus Bank',
    'Guaranty Trust Bank', 'Heritage Bank', 'Keystone Bank', 'Kuda Bank',
    'Opay', 'PalmPay', 'Parallex Bank', 'Paycom', 'Polaris Bank',
    'Premium Trust Bank', 'Providus Bank', 'Stanbic IBTC Bank',
    'Standard Chartered Bank', 'Sterling Bank', 'Suntrust Bank',
    'TajBank', 'Tangerine Money', 'Titan Trust Bank', 'Union Bank',
    'United Bank for Africa', 'Unity Bank', 'VFD Microfinance Bank',
    'Visa', 'Wema Bank', 'Zenith Bank'
  ]

  // Fetch data from API
  useEffect(() => {
    fetchAccounts()
  }, [filters])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.accountType) params.append('accountType', filters.accountType)
      if (filters.bankName) params.append('bankName', filters.bankName)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/bank?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setAccounts(data.accounts || [])
      } else {
        setError(data.error || 'Failed to fetch bank accounts')
      }
    } catch (err) {
      setError('Failed to fetch bank accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        await fetchAccounts()
        
        // Reset form
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
        setShowForm(false)
        setEditingId(null)
      } else {
        setError(data.error || 'Failed to save bank account')
      }
    } catch (error) {
      setError('Failed to save bank account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'active' | 'inactive' | 'suspended' | 'closed') => {
    try {
      const response = await fetch(`/api/bank/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (response.ok) {
        await fetchAccounts()
      } else {
        setError(data.error || 'Failed to update account status')
      }
    } catch (error) {
      setError('Failed to update account status')
    }
  }

  const handleBalanceUpdate = async (id: string, currentBalance: number) => {
    try {
      const response = await fetch(`/api/bank/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBalance })
      })

      const data = await response.json()

      if (response.ok) {
        await fetchAccounts()
      } else {
        setError(data.error || 'Failed to update account balance')
      }
    } catch (error) {
      setError('Failed to update account balance')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success)'
      case 'inactive': return 'var(--muted)'
      case 'suspended': return 'var(--warning)'
      case 'closed': return 'var(--danger)'
      default: return 'var(--muted)'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading bank accounts...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Bank Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Account'}
        </button>
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
            <label>Account Type</label>
            <select
              value={filters.accountType}
              onChange={(e) => setFilters({ ...filters, accountType: e.target.value })}
            >
              <option value="">All Types</option>
              {accountTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Bank Name</label>
            <select
              value={filters.bankName}
              onChange={(e) => setFilters({ ...filters, bankName: e.target.value })}
            >
              <option value="">All Banks</option>
              {nigerianBanks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by account name, number, or bank..."
            />
          </div>
        </div>
      </div>

      {/* Bank Account Form */}
      {showForm && (
        <div className="card">
          <h2>{editingId ? 'Edit Bank Account' : 'Add New Bank Account'}</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Account Name *</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., ECWA Main Account"
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="10-digit account number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Bank Name *</label>
                <select
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  required
                >
                  <option value="">Select Bank</option>
                  {nigerianBanks.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Account Type *</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                  required
                >
                  {accountTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Currency *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  required
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Opening Date *</label>
                <input
                  type="date"
                  value={formData.openingDate}
                  onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g., Jos Central Branch"
                />
              </div>
              <div className="form-group">
                <label>Bank Code</label>
                <input
                  type="text"
                  value={formData.bankCode}
                  onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                  placeholder="Bank code"
                />
              </div>
              <div className="form-group">
                <label>Current Balance</label>
                <input
                  type="number"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>SWIFT Code</label>
                <input
                  type="text"
                  value={formData.swiftCode}
                  onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., FBNINGLA"
                />
              </div>
              <div className="form-group">
                <label>IBAN</label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                  placeholder="International Bank Account Number"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Additional notes about this account..."
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
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bank Accounts List */}
      <div className="card">
        <h2>Bank Accounts ({accounts.length})</h2>
        {accounts.length === 0 ? (
          <div className="empty-state">
            <p>No bank accounts found. Add a new account to get started.</p>
          </div>
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
                {accounts.map(account => (
                  <tr key={account.id}>
                    <td>
                      <div>
                        <strong>{account.accountName}</strong>
                        {account.notes && (
                          <>
                            <br />
                            <small>{account.notes}</small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <code>{account.accountNumber}</code>
                    </td>
                    <td>
                      <div>
                        <strong>{account.bankName}</strong>
                        {account.branch && (
                          <>
                            <br />
                            <small>{account.branch}</small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge">
                        {accountTypes.find(t => t.value === account.accountType)?.label}
                      </span>
                    </td>
                    <td>
                      <strong>{account.currency}</strong>
                    </td>
                    <td>
                      <strong>{formatCurrency(account.currentBalance, account.currency)}</strong>
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{ backgroundColor: getStatusColor(account.status) }}
                      >
                        {account.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            const newBalance = prompt(`Update balance for ${account.accountName}:`, account.currentBalance.toString())
                            if (newBalance && !isNaN(Number(newBalance))) {
                              handleBalanceUpdate(account.id, Number(newBalance))
                            }
                          }}
                        >
                          Update Balance
                        </button>
                        {account.status === 'active' && (
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(account.id, 'inactive')}
                          >
                            Deactivate
                          </button>
                        )}
                        {account.status === 'inactive' && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(account.id, 'active')}
                          >
                            Activate
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            if (confirm(`Are you sure you want to close ${account.accountName}?`)) {
                              handleStatusChange(account.id, 'closed')
                            }
                          }}
                        >
                          Close
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

      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
        }
      `}</style>
    </div>
  )
}