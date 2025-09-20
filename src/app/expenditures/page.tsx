"use client"
import { useState, useEffect } from "react"
import { ExpenditureRecord, formatCurrency, getStatusColor, getStatusIcon } from "@/lib/expenditure"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function ExpendituresPage(){
  const [expenditures, setExpenditures] = useState<ExpenditureRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExpenditures()
  }, [])

  const fetchExpenditures = async () => {
    try {
      const response = await fetch('/api/expenditures')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch expenditures')
      }

      setExpenditures(data.expenditures || [])
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Expenditures</h2></div>
        <div className="card" style={{padding:'1rem', textAlign: 'center'}}>
          Loading expenditures...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container">
        <div className="section-title"><h2>Expenditures</h2></div>
        <div className="card" style={{padding:'1rem', color: '#FCA5A5', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)'}}>
          Error: {error}
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Expenditures</h2>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <a href="/expenditures/new" className="btn primary">➕ Raise New</a>
        </div>
      </div>

      {expenditures.length === 0 ? (
        <div className="card" style={{padding:'2rem', textAlign: 'center'}}>
          <p className="muted">No expenditures found.</p>
          <a href="/expenditures/new" className="btn primary" style={{marginTop: '1rem'}}>Raise First Expenditure</a>
        </div>
      ) : (
        <div className="card" style={{padding:'0'}}>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)'}}>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Purpose</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Category</th>
                  <th style={{padding: '1rem', textAlign: 'right', fontWeight: '600'}}>Amount</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Beneficiary</th>
                  <th style={{padding: '1rem', textAlign: 'center', fontWeight: '600'}}>Status</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Submitted</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenditures.map((expenditure) => (
                  <tr key={expenditure.id} style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '1rem'}}>
                      <div style={{fontWeight: '500'}}>{expenditure.purpose}</div>
                      {expenditure.viaAgency && (
                        <div style={{fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem'}}>
                          🏛️ Agency Policy
                        </div>
                      )}
                    </td>
                    <td style={{padding: '1rem'}}>
                      <span className="badge" style={{fontSize: '0.75rem'}}>
                        {expenditure.category}
                      </span>
                    </td>
                    <td style={{padding: '1rem', textAlign: 'right', fontWeight: '600'}}>
                      {formatCurrency(expenditure.amount)}
                    </td>
                    <td style={{padding: '1rem'}}>
                      <div>{expenditure.beneficiary}</div>
                      {expenditure.bankName && (
                        <div style={{fontSize: '0.75rem', color: 'var(--muted)'}}>
                          {expenditure.bankName} • {expenditure.accountNumber}
                        </div>
                      )}
                    </td>
                    <td style={{padding: '1rem', textAlign: 'center'}}>
                      <span 
                        className="badge" 
                        style={{
                          backgroundColor: getStatusColor(expenditure.status),
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                      >
                        {getStatusIcon(expenditure.status)} {expenditure.status.toUpperCase()}
                      </span>
                      {expenditure.rejectionNote && (
                        <div style={{fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem', maxWidth: '200px'}}>
                          {expenditure.rejectionNote}
                        </div>
                      )}
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem', color: 'var(--muted)'}}>
                      <div>{formatDate(expenditure.submittedAt)}</div>
                      <div style={{fontSize: '0.75rem'}}>by {expenditure.submittedByName}</div>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <div style={{display: 'flex', gap: '0.25rem'}}>
                        <button 
                          className="btn ghost" 
                          style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
                          onClick={() => {
                            // TODO: Add view details functionality
                            alert(`Expenditure ID: ${expenditure.id}`)
                          }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

 

