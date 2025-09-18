"use client"

export default function IncomePage(){
  return (
    <section className="container">
      <div className="section-title"><h2>Income</h2></div>
      <div className="card" style={{padding:'1rem'}}>
        <div className="row">
          <input placeholder="Search…" />
          <div style={{display:'flex',gap:'.5rem'}}>
            <button className="btn secondary" onClick={()=>alert('Record Income')}>Record Income</button>
            <button className="btn ghost" onClick={()=>alert('Reconciling with bank…')}>Reconcile</button>
          </div>
        </div>
        <table className="table" style={{marginTop:'1rem'}}>
          <thead><tr><th>Ref</th><th>Source</th><th>Giver</th><th>Narration</th><th>Amount</th><th>Bank Ref</th></tr></thead>
          <tbody>
            <tr><td>INC-0204</td><td>Tithe</td><td>John A.</td><td>September tithe</td><td>₦1,240,000</td><td>TRX-71011</td></tr>
            <tr><td>INC-0203</td><td>Offering</td><td>Mary J.</td><td>Sunday service</td><td>₦310,000</td><td>TRX-70331</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}


