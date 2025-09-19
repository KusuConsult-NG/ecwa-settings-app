"use client"
import { useState, useEffect } from "react"

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  balance: number;
}

interface Transaction {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference: string;
  category: string;
  date: string;
  balance: number;
}

interface StatementFilters {
  accountId: string;
  startDate: string;
  endDate: string;
  type: 'all' | 'credit' | 'debit';
  category: string;
}

export default function BankStatementsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<StatementFilters>({
    accountId: '',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'all',
    category: ''
  })
  const [generating, setGenerating] = useState(false)

  const transactionCategories = [
    'Tithes & Offerings', 'Donations', 'Expenses', 'Salaries', 'Utilities',
    'Maintenance', 'Equipment', 'Travel', 'Training', 'Other'
  ]

  // Mock data
  useEffect(() => {
    setAccounts([
      {
        id: 'acc1',
        accountName: 'ECWA Main Account',
        accountNumber: '1234567890',
        bankName: 'First Bank of Nigeria',
        currency: 'NGN',
        balance: 2500000
      },
      {
        id: 'acc2',
        accountName: 'ECWA Savings Account',
        accountNumber: '0987654321',
        bankName: 'Access Bank',
        currency: 'NGN',
        balance: 1500000
      }
    ])

    setTransactions([
      {
        id: 'txn1',
        accountId: 'acc1',
        type: 'credit',
        amount: 500000,
        description: 'Monthly Tithes Collection',
        reference: 'TXN001',
        category: 'Tithes & Offerings',
        date: '2024-01-15',
        balance: 2500000
      },
      {
        id: 'txn2',
        accountId: 'acc1',
        type: 'debit',
        amount: 150000,
        description: 'Staff Salaries',
        reference: 'TXN002',
        category: 'Salaries',
        date: '2024-01-14',
        balance: 2000000
      },
      {
        id: 'txn3',
        accountId: 'acc1',
        type: 'credit',
        amount: 100000,
        description: 'Donation from Member',
        reference: 'TXN003',
        category: 'Donations',
        date: '2024-01-13',
        balance: 2150000
      },
      {
        id: 'txn4',
        accountId: 'acc1',
        type: 'debit',
        amount: 50000,
        description: 'Church Maintenance',
        reference: 'TXN004',
        category: 'Maintenance',
        date: '2024-01-12',
        balance: 2050000
      }
    ])
    setLoading(false)
  }, [])

  // Filter transactions based on current filters
  useEffect(() => {
    let filtered = transactions

    if (filters.accountId) {
      filtered = filtered.filter(txn => txn.accountId === filters.accountId)
    }

    if (filters.startDate) {
      filtered = filtered.filter(txn => txn.date >= filters.startDate)
    }

    if (filters.endDate) {
      filtered = filtered.filter(txn => txn.date <= filters.endDate)
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(txn => txn.type === filters.type)
    }

    if (filters.category) {
      filtered = filtered.filter(txn => txn.category === filters.category)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(filtered)
  }, [transactions, filters])

  const handleFilterChange = (field: keyof StatementFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const generateStatement = async () => {
    setGenerating(true)
    
    try {
      // Simulate statement generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would generate a PDF or download
      const selectedAccount = accounts.find(acc => acc.id === filters.accountId)
      const statementData = {
        account: selectedAccount,
        period: `${filters.startDate} to ${filters.endDate}`,
        transactions: filteredTransactions,
        summary: {
          totalCredits: filteredTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
          totalDebits: filteredTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
          openingBalance: filteredTransactions.length > 0 ? filteredTransactions[filteredTransactions.length - 1].balance : 0,
          closingBalance: filteredTransactions.length > 0 ? filteredTransactions[0].balance : 0
        }
      }
      
      // For now, just show an alert with the summary
      alert(`Statement Generated!\n\nAccount: ${selectedAccount?.accountName}\nPeriod: ${statementData.period}\nTransactions: ${filteredTransactions.length}\nTotal Credits: ${formatCurrency(statementData.summary.totalCredits)}\nTotal Debits: ${formatCurrency(statementData.summary.totalDebits)}`)
      
    } catch (error) {
      setError('Failed to generate statement')
    } finally {
      setGenerating(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getSelectedAccount = () => {
    return accounts.find(acc => acc.id === filters.accountId)
  }

  const getSummary = () => {
    const totalCredits = filteredTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
    const totalDebits = filteredTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
    const netAmount = totalCredits - totalDebits
    
    return { totalCredits, totalDebits, netAmount }
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Generate Bank Statements</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading accounts...</p>
        </div>
      </section>
    )
  }

  const summary = getSummary()
  const selectedAccount = getSelectedAccount()

  return (
    <section className="container">
      <div className="section-title">
        <h2>Generate Bank Statements</h2>
      </div>

      {error && (
        <div className="alert alert-error" style={{marginBottom: '1rem'}}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{marginBottom: '2rem'}}>
        <h3 style={{marginBottom: '1rem'}}>Statement Filters</h3>
        <form className="form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="accountId">Account *</label>
              <select
                id="accountId"
                value={filters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
                required
              >
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountName} - {acc.accountNumber} ({acc.bankName})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="type">Transaction Type</label>
              <select
                id="type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credits Only</option>
                <option value="debit">Debits Only</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {transactionCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>&nbsp;</label>
              <button
                type="button"
                className="btn btn-primary"
                onClick={generateStatement}
                disabled={!filters.accountId || generating}
                style={{marginTop: '0.5rem'}}
              >
                {generating ? 'Generating...' : 'Generate Statement'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Summary */}
      {selectedAccount && (
        <div className="grid cols-3" style={{marginBottom: '2rem'}}>
          <div className="card" style={{textAlign: 'center'}}>
            <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text)'}}>Account Balance</h3>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)'}}>
              {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
            </div>
            <div style={{fontSize: '14px', color: 'var(--muted)'}}>
              {selectedAccount.accountName}
            </div>
          </div>
          
          <div className="card" style={{textAlign: 'center'}}>
            <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text)'}}>Total Credits</h3>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)'}}>
              {formatCurrency(summary.totalCredits, selectedAccount.currency)}
            </div>
            <div style={{fontSize: '14px', color: 'var(--muted)'}}>
              {filteredTransactions.filter(t => t.type === 'credit').length} transactions
            </div>
          </div>
          
          <div className="card" style={{textAlign: 'center'}}>
            <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--text)'}}>Total Debits</h3>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)'}}>
              {formatCurrency(summary.totalDebits, selectedAccount.currency)}
            </div>
            <div style={{fontSize: '14px', color: 'var(--muted)'}}>
              {filteredTransactions.filter(t => t.type === 'debit').length} transactions
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>
          Transactions ({filteredTransactions.length})
          {selectedAccount && (
            <span style={{fontSize: '14px', fontWeight: 'normal', color: 'var(--muted)', marginLeft: '1rem'}}>
              - {selectedAccount.accountName} ({filters.startDate} to {filters.endDate})
            </span>
          )}
        </h3>
        
        {filteredTransactions.length === 0 ? (
          <p>No transactions found for the selected criteria.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Reference</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: transaction.type === 'credit' ? 'var(--success)' : 'var(--danger)',
                          color: 'white'
                        }}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.description}</td>
                    <td>{transaction.reference}</td>
                    <td>{transaction.category}</td>
                    <td>
                      <span style={{color: transaction.type === 'credit' ? 'var(--success)' : 'var(--danger)'}}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount, selectedAccount?.currency)}
                      </span>
                    </td>
                    <td><strong>{formatCurrency(transaction.balance, selectedAccount?.currency)}</strong></td>
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
