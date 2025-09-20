"use client"
import { useState, useEffect } from "react"
import { IncomeRecord, formatCurrency, INCOME_SOURCES, generateIncomeRef } from "@/lib/income"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function IncomePage(){
  const [income, setIncome] = useState<IncomeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Form state
  const [ref, setRef] = useState("")
  const [source, setSource] = useState("Tithe")
  const [giver, setGiver] = useState("")
  const [narration, setNarration] = useState("")
  const [amount, setAmount] = useState("")
  const [bankRef, setBankRef] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  useEffect(() => {
    fetchIncome()
    // Generate a default ref
    setRef(generateIncomeRef())
  }, [])

  const fetchIncome = async () => {
    try {
      const response = await fetch('/api/income')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch income')
      }

      setIncome(data.income || [])
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    setFormSuccess(false)

    // Basic validation
    if (!ref.trim() || !source.trim() || !giver.trim() || !narration.trim() || !amount || !bankRef.trim()) {
      setFormError("All fields are required")
      setFormLoading(false)
      return
    }

    if (Number(amount) <= 0) {
      setFormError("Amount must be greater than 0")
      setFormLoading(false)
      return
    }

    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: ref.trim(),
          source: source.trim(),
          giver: giver.trim(),
          narration: narration.trim(),
          amount: Number(amount),
          bankRef: bankRef.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record income')
      }

      setFormSuccess(true)
      
      // Reset form
      setRef(generateIncomeRef())
      setSource("Tithe")
      setGiver("")
      setNarration("")
      setAmount("")
      setBankRef("")

      // Refresh income list
      await fetchIncome()

      // Hide success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(false)
      }, 3000)

    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred')
    } finally {
      setFormLoading(false)
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

  // Filter income based on search term
  const filteredIncome = income.filter(item => 
    item.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.giver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bankRef.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Income</h2></div>
        <div className="card" style={{padding:'1rem', textAlign: 'center'}}>
          Loading income records...
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Income</h2>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button 
            className="btn primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Hide Form' : 'Record Income'}
          </button>
          <button className="btn ghost" onClick={()=>alert('Reconciling with bank…')}>Reconcile</button>
        </div>
      </div>

      {/* Income Recording Form */}
      {showForm && (
        <div className="card" style={{padding:'1rem', marginBottom:'1rem'}}>
          <h3 style={{margin: '0 0 1rem 0'}}>Record New Income</h3>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div>
                <label>Ref*</label>
                <input 
                  value={ref} 
                  onChange={e => setRef(e.target.value)} 
                  placeholder="e.g., INC-20240918001"
                  required
                />
              </div>
              <div>
                <label>Source*</label>
                <select value={source} onChange={e => setSource(e.target.value)} required>
                  {INCOME_SOURCES.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="row">
              <div>
                <label>Giver*</label>
                <input 
                  value={giver} 
                  onChange={e => setGiver(e.target.value)} 
                  placeholder="e.g., John A."
                  required
                />
              </div>
              <div>
                <label>Amount (₦)*</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Narration*</label>
                <input 
                  value={narration} 
                  onChange={e => setNarration(e.target.value)} 
                  placeholder="e.g., September tithe"
                  required
                />
              </div>
              <div>
                <label>Bank Ref*</label>
                <input 
                  value={bankRef} 
                  onChange={e => setBankRef(e.target.value)} 
                  placeholder="e.g., TRX-71011"
                  required
                />
              </div>
            </div>
            <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem'}}>
              <button 
                type="button" 
                className="btn ghost" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn primary" 
                disabled={formLoading}
              >
                {formLoading ? 'Recording...' : 'Record Income'}
              </button>
            </div>
          </form>

          {formError && (
            <div style={{color: '#FCA5A5', marginTop: '1rem', padding: '0.5rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '0.375rem'}}>
              {formError}
            </div>
          )}

          {formSuccess && (
            <div style={{color: '#86EFAC', marginTop: '1rem', padding: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.375rem'}}>
              ✅ Income recorded successfully!
            </div>
          )}
        </div>
      )}

      {/* Income List */}
      <div className="card" style={{padding:'1rem'}}>
        <div className="row" style={{marginBottom: '1rem'}}>
          <input 
            placeholder="Search income records…" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {error ? (
          <div style={{color: '#FCA5A5', padding: '1rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '0.375rem'}}>
            Error: {error}
          </div>
        ) : filteredIncome.length === 0 ? (
          <div style={{padding: '2rem', textAlign: 'center'}}>
            <p className="muted">
              {searchTerm ? 'No income records found matching your search.' : 'No income records found.'}
            </p>
            {!searchTerm && (
              <button 
                className="btn primary" 
                style={{marginTop: '1rem'}}
                onClick={() => setShowForm(true)}
              >
                Record First Income
              </button>
            )}
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="table" style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)'}}>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Ref</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Source</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Giver</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Narration</th>
                  <th style={{padding: '1rem', textAlign: 'right', fontWeight: '600'}}>Amount</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Bank Ref</th>
                  <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncome.map((item) => (
                  <tr key={item.id} style={{borderBottom: '1px solid var(--border)'}}>
                    <td style={{padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem'}}>
                      {item.ref}
                    </td>
                    <td style={{padding: '1rem'}}>
                      <span className="badge" style={{fontSize: '0.75rem'}}>
                        {item.source}
                      </span>
                    </td>
                    <td style={{padding: '1rem', fontWeight: '500'}}>
                      {item.giver}
                    </td>
                    <td style={{padding: '1rem'}}>
                      {item.narration}
                    </td>
                    <td style={{padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--success)'}}>
                      {formatCurrency(item.amount)}
                    </td>
                    <td style={{padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--muted)'}}>
                      {item.bankRef}
                    </td>
                    <td style={{padding: '1rem', fontSize: '0.875rem', color: 'var(--muted)'}}>
                      {formatDate(item.submittedAt)}
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


