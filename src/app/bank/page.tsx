"use client"
import { useState, useEffect } from "react"

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'savings' | 'current' | 'fixed_deposit' | 'investment';
  currency: string;
  balance: number;
  openingDate: string;
  status: 'active' | 'inactive' | 'closed';
  branch: string;
  swiftCode?: string;
  iban?: string;
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
    accountType: 'savings' as 'savings' | 'current' | 'fixed_deposit' | 'investment',
    currency: 'NGN',
    openingDate: '',
    branch: '',
    swiftCode: '',
    iban: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const accountTypes = [
    { value: 'savings', label: 'Savings Account' },
    { value: 'current', label: 'Current Account' },
    { value: 'fixed_deposit', label: 'Fixed Deposit' },
    { value: 'investment', label: 'Investment Account' }
  ]

  const currencies = ['NGN', 'USD', 'EUR', 'GBP']

  // Mock data
  useEffect(() => {
    setAccounts([
      {
        id: 'acc1',
        accountName: 'ECWA Main Account',
        accountNumber: '1234567890',
        bankName: 'First Bank of Nigeria',
        accountType: 'current',
        currency: 'NGN',
        balance: 2500000,
        openingDate: '2020-01-15',
        status: 'active',
        branch: 'Jos Central Branch',
        swiftCode: 'FBNINGLA',
        iban: 'NG1234567890123456789012',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ])
    setLoading(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      if (editingId) {
        setAccounts(prev => prev.map(acc => 
          acc.id === editingId 
            ? { ...acc, ...formData, updatedAt: new Date().toISOString() }
            : acc
        ))
      } else {
        const newAccount: BankAccount = {
          id: `acc_${Date.now()}`,
          ...formData,
          balance: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setAccounts(prev => [...prev, newAccount])
      }
      
      setFormData({
        accountName: '',
        accountNumber: '',
        bankName: '',
        accountType: 'savings',
        currency: 'NGN',
        openingDate: '',
        branch: '',
        swiftCode: '',
        iban: ''
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      setError('Failed to save account')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Bank Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading bank accounts...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Bank Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Account'}
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
            {editingId ? 'Edit Account' : 'Add New Account'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accountName">Account Name *</label>
                <input
                  type="text"
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({...prev, accountName: e.target.value}))}
                  required
                  placeholder="Enter account name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="accountNumber">Account Number *</label>
                <input
                  type="text"
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({...prev, accountNumber: e.target.value}))}
                  required
                  placeholder="Enter account number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bankName">Bank Name *</label>
                <input
                  type="text"
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({...prev, bankName: e.target.value}))}
                  required
                  placeholder="Enter bank name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="accountType">Account Type *</label>
                <select
                  id="accountType"
                  value={formData.accountType}
                  onChange={(e) => setFormData(prev => ({...prev, accountType: e.target.value as 'savings' | 'current' | 'fixed_deposit' | 'investment'}))}
                  required
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currency">Currency *</label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({...prev, currency: e.target.value}))}
                  required
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="openingDate">Opening Date *</label>
                <input
                  type="date"
                  id="openingDate"
                  value={formData.openingDate}
                  onChange={(e) => setFormData(prev => ({...prev, openingDate: e.target.value}))}
                  required
                />
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
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    accountType: 'savings',
                    currency: 'NGN',
                    openingDate: '',
                    branch: '',
                    swiftCode: '',
                    iban: ''
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
                {submitting ? 'Saving...' : (editingId ? 'Update Account' : 'Add Account')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Bank Accounts ({accounts.length})</h3>
        
        {accounts.length === 0 ? (
          <p>No accounts found. Add one using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Bank</th>
                  <th>Account Number</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td><strong>{account.accountName}</strong></td>
                    <td>{account.bankName}</td>
                    <td>{account.accountNumber}</td>
                    <td>
                      <span className="badge" style={{backgroundColor: '#3B82F6', color: 'white'}}>
                        {account.accountType}
                      </span>
                    </td>
                    <td><strong>{formatCurrency(account.balance, account.currency)}</strong></td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-secondary">Edit</button>
                        <button className="btn btn-sm btn-danger">Delete</button>
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