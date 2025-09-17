"use client"
import { useState } from "react"

export default function RaiseExpenditurePage(){
  const [purpose,setPurpose]=useState("")
  const [category,setCategory]=useState("Maintenance")
  const [amount,setAmount]=useState("")
  const [beneficiary,setBeneficiary]=useState("")
  const [bankName,setBankName]=useState("")
  const [accountNumber,setAccountNumber]=useState("")
  const [viaAgency,setViaAgency]=useState(false)

  function submit(){
    alert(viaAgency?"Submitted (Agency flow: CEL → Secretary → Senior Minister → Finance)":"Submitted (Finance hierarchy)")
  }

  return (
    <section className="container">
      <div className="section-title"><h2>Raise Expenditure</h2></div>
      <div className="card" style={{padding:'1rem'}}>
        <div className="row">
          <div><label>Purpose*</label><input value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="e.g., Roof repair"/></div>
          <div><label>Category*</label><select value={category} onChange={e=>setCategory(e.target.value)}><option>Maintenance</option><option>Welfare</option><option>Admin</option></select></div>
        </div>
        <div className="row">
          <div><label>Amount (₦)*</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/></div>
          <div><label>Beneficiary Name</label><input value={beneficiary} onChange={e=>setBeneficiary(e.target.value)} placeholder="Vendor/Staff name"/></div>
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
            <button className="btn primary" onClick={submit}>Submit</button>
          </div>
        </div>
        <div className="muted" style={{marginTop:'.5rem'}}>
          {viaAgency ? 'Agency approvals: Agency → CEL → Secretary → Senior Minister → Financial Secretary/Treasurer.' : 'Finance approvals: Secretary → Senior Minister → Finance officers.'}
        </div>
      </div>
    </section>
  )
}


