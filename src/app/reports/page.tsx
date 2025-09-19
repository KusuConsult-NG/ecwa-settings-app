"use client"
import { useState, useEffect } from "react"

interface ReportData {
  summary: {
    totalIncome: number;
    totalExpenditures: number;
    netProfit: number;
    profitMargin: number;
  };
  expenditureBreakdown: { [key: string]: number };
  incomeBreakdown: { [key: string]: number };
  recentTransactions: {
    expenditures: any[];
    income: any[];
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportType, setReportType] = useState('financial')
  const [duration, setDuration] = useState('30')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const reportTypes = [
    { value: 'financial', label: 'Financial Report' },
    { value: 'hr', label: 'HR Report' },
    { value: 'operations', label: 'Operations Report' },
    { value: 'comprehensive', label: 'Comprehensive Report' }
  ]

  const durations = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ]

  // Fetch data from API
  useEffect(() => {
    fetchReportData()
  }, [reportType, duration, startDate, endDate])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      params.append('type', reportType)
      
      if (duration === 'custom' && startDate && endDate) {
        params.append('startDate', startDate)
        params.append('endDate', endDate)
      } else {
        params.append('period', duration)
      }

      const response = await fetch(`/api/reports?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setReportData(data.data)
      } else {
        setError(data.error || 'Failed to generate report')
      }
    } catch (err) {
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0
    return ((value / total) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Generating report...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Financial Reports</h1>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Report Controls */}
      <div className="card">
        <h3>Report Settings</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {durations.map(dur => (
                <option key={dur.value} value={dur.value}>{dur.label}</option>
              ))}
            </select>
          </div>
          {duration === 'custom' && (
            <>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid cols-4">
            <div className="card">
              <h3>Total Income</h3>
              <div className="stat-value success">
                {formatCurrency(reportData.summary.totalIncome)}
              </div>
            </div>
            <div className="card">
              <h3>Total Expenditures</h3>
              <div className="stat-value danger">
                {formatCurrency(reportData.summary.totalExpenditures)}
              </div>
            </div>
            <div className="card">
              <h3>Net Profit</h3>
              <div className={`stat-value ${reportData.summary.netProfit >= 0 ? 'success' : 'danger'}`}>
                {formatCurrency(reportData.summary.netProfit)}
              </div>
            </div>
            <div className="card">
              <h3>Profit Margin</h3>
              <div className="stat-value">
                {reportData.summary.profitMargin}%
              </div>
            </div>
          </div>

          {/* Expenditure Breakdown */}
          <div className="card">
            <h2>Expenditure Breakdown</h2>
            <div className="breakdown-list">
              {Object.entries(reportData.expenditureBreakdown).map(([category, amount]) => (
                <div key={category} className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="category">{category}</span>
                    <span className="amount">{formatCurrency(amount)}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${getPercentage(amount, reportData.summary.totalExpenditures)}%`,
                        backgroundColor: 'var(--danger)'
                      }}
                    ></div>
                  </div>
                  <div className="breakdown-percentage">
                    {getPercentage(amount, reportData.summary.totalExpenditures)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="card">
            <h2>Income Breakdown</h2>
            <div className="breakdown-list">
              {Object.entries(reportData.incomeBreakdown).map(([source, amount]) => (
                <div key={source} className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="category">{source}</span>
                    <span className="amount">{formatCurrency(amount)}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${getPercentage(amount, reportData.summary.totalIncome)}%`,
                        backgroundColor: 'var(--success)'
                      }}
                    ></div>
                  </div>
                  <div className="breakdown-percentage">
                    {getPercentage(amount, reportData.summary.totalIncome)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="grid cols-2">
            <div className="card">
              <h2>Recent Expenditures</h2>
              {reportData.recentTransactions.expenditures.length === 0 ? (
                <p className="text-muted">No recent expenditures</p>
              ) : (
                <div className="transaction-list">
                  {reportData.recentTransactions.expenditures.map((expenditure, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-details">
                        <div className="transaction-description">{expenditure.description}</div>
                        <div className="transaction-meta">
                          {expenditure.category} • {formatDate(expenditure.createdAt)}
                        </div>
                      </div>
                      <div className="transaction-amount danger">
                        -{formatCurrency(expenditure.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2>Recent Income</h2>
              {reportData.recentTransactions.income.length === 0 ? (
                <p className="text-muted">No recent income</p>
              ) : (
                <div className="transaction-list">
                  {reportData.recentTransactions.income.map((income, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-details">
                        <div className="transaction-description">{income.narration}</div>
                        <div className="transaction-meta">
                          {income.source} • {formatDate(income.createdAt)}
                        </div>
                      </div>
                      <div className="transaction-amount success">
                        +{formatCurrency(income.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        
        .stat-value.success {
          color: var(--success);
        }
        
        .stat-value.danger {
          color: var(--danger);
        }
        
        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .breakdown-item {
          padding: 1rem;
          background: var(--background-secondary);
          border-radius: 0.5rem;
          border: 1px solid var(--border);
        }
        
        .breakdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .category {
          font-weight: 500;
          color: var(--text);
        }
        
        .amount {
          font-weight: bold;
          color: var(--text);
        }
        
        .breakdown-bar {
          width: 100%;
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .breakdown-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .breakdown-percentage {
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-align: right;
        }
        
        .transaction-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--background-secondary);
          border-radius: 0.5rem;
          border: 1px solid var(--border);
        }
        
        .transaction-details {
          flex: 1;
        }
        
        .transaction-description {
          font-weight: 500;
          color: var(--text);
          margin-bottom: 0.25rem;
        }
        
        .transaction-meta {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .transaction-amount {
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .transaction-amount.success {
          color: var(--success);
        }
        
        .transaction-amount.danger {
          color: var(--danger);
        }
        
        .text-muted {
          color: var(--muted);
          font-style: italic;
          text-align: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  )
}