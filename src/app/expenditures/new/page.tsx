"use client"
import { useState } from "react"
import { EXPENDITURE_CATEGORIES } from "@/lib/expenditure"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function RaiseExpenditurePage(){
  const [purpose,setPurpose]=useState("")
  const [category,setCategory]=useState("Maintenance")
  const [amount,setAmount]=useState("")
  const [beneficiary,setBeneficiary]=useState("")
  const [bankName,setBankName]=useState("")
  const [accountNumber,setAccountNumber]=useState("")
  const [viaAgency,setViaAgency]=useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Basic validation
    if (!purpose.trim()) {
      setError("Purpose is required")
      setLoading(false)
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0")
      setLoading(false)
      return
    }

    if (!beneficiary.trim()) {
      setError("Beneficiary name is required")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/expenditures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose: purpose.trim(),
          category,
          amount: Number(amount),
          beneficiary: beneficiary.trim(),
          bankName: bankName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          viaAgency
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit expenditure')
      }

      setSuccess(true)
      
      // Reset form
      setPurpose("")
      setAmount("")
      setBeneficiary("")
      setBankName("")
      setAccountNumber("")
      setViaAgency(false)

      // Show success message
      setTimeout(() => {
        setSuccess(false)
      }, 5000)

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="section-title"><h2>Raise Expenditure</h2></div>
      <div className="card" style={{padding:'1rem'}}>
        <form onSubmit={submit}>
          <div className="row">
            <div><label>Purpose*</label><input value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="e.g., Roof repair" required/></div>
            <div><label>Category*</label>
              <select value={category} onChange={e=>setCategory(e.target.value)} required>
                {EXPENDITURE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row">
            <div><label>Amount (₦)*</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" required/></div>
            <div><label>Beneficiary Name*</label><input value={beneficiary} onChange={e=>setBeneficiary(e.target.value)} placeholder="Vendor/Staff name" required/></div>
          </div>
          <div className="row">
            <div><label>Bank Name</label><input value={bankName} onChange={e=>setBankName(e.target.value)} placeholder="e.g., Gowans MFB"/></div>
            <div><label>Account Number</label><input value={accountNumber} onChange={e=>setAccountNumber(e.target.value)} placeholder="0000000000"/></div>
          </div>
          <div className="row">
            <div><label>Agency Expenditure?</label>
              <select value={viaAgency?"yes":"no"} onChange={e=>setViaAgency(e.target.value==="yes")}> 
                <option value="no">No (General church)</option>
                <option value="yes">Yes (Agency policy)</option>
              </select>
            </div>
            <div style={{display:'flex',alignItems:'end'}}>
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
          <div className="muted" style={{marginTop:'.5rem'}}>
            {viaAgency ? 'Agency approvals: Agency → CEL → Secretary → Senior Minister → Financial Secretary/Treasurer.' : 'Finance approvals: Secretary → Senior Minister → Finance officers.'}
          </div>
        </form>

        {error && (
          <div style={{color: '#FCA5A5', marginTop: '1rem', padding: '0.5rem', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '0.375rem'}}>
            {error}
          </div>
        )}

        {success && (
          <div style={{color: '#86EFAC', marginTop: '1rem', padding: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.375rem'}}>
            ✅ Expenditure submitted successfully! It will appear in the expenditures list pending approval.
          </div>
        )}
      </div>
    </section>
  )
}


