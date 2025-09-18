"use client"
import { useState, useEffect } from "react"
import { ExpenditureRecord, formatCurrency, getStatusColor, getStatusIcon } from "@/lib/expenditure"

export default function ApprovalsPage(){
  const [expenditures, setExpenditures] = useState<ExpenditureRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectionNote, setRejectionNote] = useState("")
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

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

  const handleApprove = async (expenditureId: string) => {
    setProcessingId(expenditureId)
    try {
      const response = await fetch(`/api/expenditures/${expenditureId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve expenditure')
      }

      // Refresh the list
      await fetchExpenditures()
    } catch (err: any) {
      alert(err.message || 'An unexpected error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (expenditureId: string) => {
    if (!rejectionNote.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setProcessingId(expenditureId)
    try {
      const response = await fetch(`/api/expenditures/${expenditureId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionNote: rejectionNote.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject expenditure')
      }

      // Close modal and refresh
      setShowRejectModal(null)
      setRejectionNote("")
      await fetchExpenditures()
    } catch (err: any) {
      alert(err.message || 'An unexpected error occurred')
    } finally {
      setProcessingId(null)
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

  // Filter to show only pending expenditures for approval
  const pendingExpenditures = expenditures.filter(exp => exp.status === 'pending')

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Approvals</h2></div>
        <div className="card" style={{padding:'1rem', textAlign: 'center'}}>
          Loading approvals...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container">
        <div className="section-title"><h2>Approvals</h2></div>
        <div className="card" style={{padding:'1rem', color: '#FCA5A5', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)'}}>
          Error: {error}
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Approvals</h2>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <a href="/expenditures" className="btn secondary">View All Expenditures</a>
        </div>
      </div>

      {pendingExpenditures.length === 0 ? (
        <div className="card" style={{padding:'2rem', textAlign: 'center'}}>
          <p className="muted">No pending approvals.</p>
          <a href="/expenditures" className="btn primary" style={{marginTop: '1rem'}}>View All Expenditures</a>
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
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Submitted</th>
                  <th style={{padding: '1rem', textAlign: 'center', fontWeight: '600'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingExpenditures.map((expenditure) => (
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
                    <td style={{padding: '1rem', fontSize: '0.875rem', color: 'var(--muted)'}}>
                      <div>{formatDate(expenditure.submittedAt)}</div>
                      <div style={{fontSize: '0.75rem'}}>by {expenditure.submittedByName}</div>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
                        <button 
                          className="btn primary" 
                          style={{fontSize: '0.75rem', padding: '0.5rem 1rem'}}
                          onClick={() => handleApprove(expenditure.id)}
                          disabled={processingId === expenditure.id}
                        >
                          {processingId === expenditure.id ? 'Approving...' : '✅ Approve'}
                        </button>
                        <button 
                          className="btn ghost" 
                          style={{fontSize: '0.75rem', padding: '0.5rem 1rem', color: 'var(--danger)'}}
                          onClick={() => setShowRejectModal(expenditure.id)}
                          disabled={processingId === expenditure.id}
                        >
                          ❌ Reject
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

      {/* Rejection Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{margin: '0 0 1rem 0'}}>Reject Expenditure</h3>
            <p style={{margin: '0 0 1rem 0', color: 'var(--muted)'}}>
              Please provide a reason for rejecting this expenditure request.
            </p>
            <textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '0.375rem',
                resize: 'vertical',
                marginBottom: '1rem'
              }}
            />
            <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
              <button 
                className="btn ghost"
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectionNote("")
                }}
              >
                Cancel
              </button>
              <button 
                className="btn primary"
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal}
                style={{backgroundColor: 'var(--danger)'}}
              >
                {processingId === showRejectModal ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

 

