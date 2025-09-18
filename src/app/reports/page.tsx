"use client"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/expenditure"

export default function ReportsPage(){
  const [reportType, setReportType] = useState("expenditures")
  const [duration, setDuration] = useState("30")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))
    
    setToDate(today.toISOString().split('T')[0])
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0])
  }, [])

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration)
    
    const today = new Date()
    let startDate = new Date()
    
    switch (newDuration) {
      case "7":
        startDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000))
        break
      case "30":
        startDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))
        break
      case "90":
        startDate = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000))
        break
      case "365":
        startDate = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000))
        break
      case "custom":
        return // Don't change dates for custom
    }
    
    setFromDate(startDate.toISOString().split('T')[0])
    setToDate(today.toISOString().split('T')[0])
  }

  const generateReport = async () => {
    setLoading(true)
    setError(null)
    setReportData(null)

    try {
      // Simulate API call - in real app, this would fetch actual data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock report data based on type and date range
      const mockData = {
        expenditures: {
          total: 125000,
          count: 8,
          breakdown: [
            { category: "Maintenance", amount: 45000, count: 3 },
            { category: "Welfare", amount: 35000, count: 2 },
            { category: "Admin", amount: 25000, count: 2 },
            { category: "Other", amount: 20000, count: 1 }
          ],
          recent: [
            { purpose: "Roof repair", amount: 25000, date: "2024-09-18", status: "approved" },
            { purpose: "Staff welfare", amount: 15000, date: "2024-09-17", status: "pending" },
            { purpose: "Office supplies", amount: 8000, date: "2024-09-16", status: "approved" }
          ]
        },
        income: {
          total: 180000,
          count: 12,
          breakdown: [
            { source: "Tithe", amount: 120000, count: 8 },
            { source: "Offering", amount: 35000, count: 3 },
            { source: "Donation", amount: 25000, count: 1 }
          ],
          recent: [
            { giver: "John A.", source: "Tithe", amount: 15000, date: "2024-09-18" },
            { giver: "Mary J.", source: "Offering", amount: 5000, date: "2024-09-17" },
            { giver: "David K.", source: "Donation", amount: 10000, date: "2024-09-16" }
          ]
        }
      }

      setReportData(mockData[reportType as keyof typeof mockData])
    } catch (err: any) {
      setError(err.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Reports</h2>
      </div>

      {/* Report Configuration */}
      <div className="card" style={{padding:'1rem', marginBottom:'1rem'}}>
        <h3 style={{margin: '0 0 1rem 0'}}>Generate Report</h3>
        
        <div className="row">
          <div>
            <label>Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="expenditures">Expenditures Report</option>
              <option value="income">Income Report</option>
              <option value="combined">Combined Report</option>
            </select>
          </div>
          <div>
            <label>Duration</label>
            <select value={duration} onChange={e => handleDurationChange(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
        </div>

        {duration === "custom" && (
          <div className="row" style={{marginTop: '1rem'}}>
            <div>
              <label>From Date</label>
              <input 
                type="date" 
                value={fromDate} 
                onChange={e => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label>To Date</label>
              <input 
                type="date" 
                value={toDate} 
                onChange={e => setToDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}

        <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
          <button 
            className="btn primary" 
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Results */}
      {error && (
        <div className="card" style={{padding:'1rem', color: '#FCA5A5', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)'}}>
          Error: {error}
        </div>
      )}

      {reportData && (
        <div className="card" style={{padding:'1rem'}}>
          <h3 style={{margin: '0 0 1rem 0'}}>
            {reportType === 'expenditures' ? 'Expenditures' : 
             reportType === 'income' ? 'Income' : 'Combined'} Report
          </h3>
          <p className="muted" style={{margin: '0 0 1rem 0'}}>
            Period: {formatDate(fromDate)} - {formatDate(toDate)}
          </p>

          {/* Summary Stats */}
          <div className="grid cols-3" style={{marginBottom: '2rem'}}>
            <div style={{padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: '0.5rem'}}>
              <div style={{fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem'}}>Total Amount</div>
              <div style={{fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary)'}}>
                {formatCurrency(reportData.total)}
              </div>
            </div>
            <div style={{padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: '0.5rem'}}>
              <div style={{fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem'}}>Total Records</div>
              <div style={{fontSize: '1.5rem', fontWeight: '600', color: 'var(--secondary)'}}>
                {reportData.count}
              </div>
            </div>
            <div style={{padding: '1rem', backgroundColor: 'var(--surface)', borderRadius: '0.5rem'}}>
              <div style={{fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem'}}>Average</div>
              <div style={{fontSize: '1.5rem', fontWeight: '600', color: 'var(--success)'}}>
                {formatCurrency(reportData.total / reportData.count)}
              </div>
            </div>
          </div>

          {/* Breakdown by Category/Source */}
          <div style={{marginBottom: '2rem'}}>
            <h4 style={{margin: '0 0 1rem 0'}}>
              Breakdown by {reportType === 'expenditures' ? 'Category' : 'Source'}
            </h4>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)'}}>
                    <th style={{padding: '0.75rem', textAlign: 'left', fontWeight: '600'}}>
                      {reportType === 'expenditures' ? 'Category' : 'Source'}
                    </th>
                    <th style={{padding: '0.75rem', textAlign: 'right', fontWeight: '600'}}>Amount</th>
                    <th style={{padding: '0.75rem', textAlign: 'right', fontWeight: '600'}}>Count</th>
                    <th style={{padding: '0.75rem', textAlign: 'right', fontWeight: '600'}}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.breakdown.map((item: any, index: number) => (
                    <tr key={index} style={{borderBottom: '1px solid var(--border)'}}>
                      <td style={{padding: '0.75rem'}}>
                        <span className="badge" style={{fontSize: '0.75rem'}}>
                          {item.category || item.source}
                        </span>
                      </td>
                      <td style={{padding: '0.75rem', textAlign: 'right', fontWeight: '500'}}>
                        {formatCurrency(item.amount)}
                      </td>
                      <td style={{padding: '0.75rem', textAlign: 'right'}}>
                        {item.count}
                      </td>
                      <td style={{padding: '0.75rem', textAlign: 'right'}}>
                        {((item.amount / reportData.total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Records */}
          <div>
            <h4 style={{margin: '0 0 1rem 0'}}>Recent Records</h4>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)'}}>
                    <th style={{padding: '0.75rem', textAlign: 'left', fontWeight: '600'}}>Date</th>
                    <th style={{padding: '0.75rem', textAlign: 'left', fontWeight: '600'}}>
                      {reportType === 'expenditures' ? 'Purpose' : 'Giver'}
                    </th>
                    <th style={{padding: '0.75rem', textAlign: 'left', fontWeight: '600'}}>
                      {reportType === 'expenditures' ? 'Category' : 'Source'}
                    </th>
                    <th style={{padding: '0.75rem', textAlign: 'right', fontWeight: '600'}}>Amount</th>
                    {reportType === 'expenditures' && (
                      <th style={{padding: '0.75rem', textAlign: 'center', fontWeight: '600'}}>Status</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.recent.map((item: any, index: number) => (
                    <tr key={index} style={{borderBottom: '1px solid var(--border)'}}>
                      <td style={{padding: '0.75rem', fontSize: '0.875rem', color: 'var(--muted)'}}>
                        {formatDate(item.date)}
                      </td>
                      <td style={{padding: '0.75rem', fontWeight: '500'}}>
                        {item.purpose || item.giver}
                      </td>
                      <td style={{padding: '0.75rem'}}>
                        <span className="badge" style={{fontSize: '0.75rem'}}>
                          {item.category || item.source}
                        </span>
                      </td>
                      <td style={{padding: '0.75rem', textAlign: 'right', fontWeight: '500'}}>
                        {formatCurrency(item.amount)}
                      </td>
                      {reportType === 'expenditures' && (
                        <td style={{padding: '0.75rem', textAlign: 'center'}}>
                          <span 
                            className="badge" 
                            style={{
                              backgroundColor: item.status === 'approved' ? 'var(--success)' : 
                                             item.status === 'rejected' ? 'var(--danger)' : 'var(--warning)',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          >
                            {item.status?.toUpperCase()}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

 

