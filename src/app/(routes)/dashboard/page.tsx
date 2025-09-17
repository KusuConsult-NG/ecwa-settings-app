"use client"
import { useEffect, useMemo, useState } from "react"
import { fullFinanceVisibility } from "@/lib/rbac"

export default function DashboardPage() {
  const [me, setMe] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(()=>{ 
    fetch('/api/me').then(r=>r.json()).then(d=>setMe(d.user||null))
    // Check for permission error from URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('error') === 'insufficient-permissions') {
      setError('You do not have permission to access that page.')
    }
  },[])
  const canSeeFinance = useMemo(()=> me && fullFinanceVisibility.includes(me.role||""), [me])

  const [period, setPeriod] = useState<{label:string; start:Date; end:Date}>(()=>currentQuarter())
  function currentQuarter(){
    const now = new Date(); const q = Math.floor(now.getMonth()/3)
    const start = new Date(now.getFullYear(), q*3, 1)
    const end = new Date(now.getFullYear(), q*3+3, 0)
    return { label: labelRange(start,end), start, end }
  }
  function labelRange(a:Date,b:Date){
    const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    return `${m[a.getMonth()]}–${m[b.getMonth()]} ${b.getFullYear()}`
  }
  function shift(by:number){
    const s = new Date(period.start); s.setMonth(s.getMonth()+by*3)
    const e = new Date(period.end); e.setMonth(e.getMonth()+by*3)
    setPeriod({ label: labelRange(s,e), start:s, end:e })
  }

  return (
    <section className="container">
      {error && (
        <div className="card" style={{padding:"1rem", marginBottom:"1rem", background:"#FEF2F2", border:"1px solid #FECACA", color:"#DC2626"}}>
          <strong>Access Denied</strong>
          <div>{error}</div>
        </div>
      )}
      <div className="section-title">
        <h2>Dashboard</h2>
        <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
          <button className="btn ghost" onClick={()=>shift(-1)} aria-label="Previous Quarter">←</button>
          <div className="badge">{period.label}</div>
          <button className="btn ghost" onClick={()=>shift(1)} aria-label="Next Quarter">→</button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn primary" href="/expenditures/new">Raise Expenditure</a>
        </div>
      </div>
      <div className="grid cols-3">
        <div className="card" style={{padding:"1rem"}}><small className="muted">Income</small><h3>₦12.4m</h3><div className="muted">{period.label}</div></div>
        <div className="card" style={{padding:"1rem"}}><small className="muted">Expenditure</small><h3>₦7.9m</h3><div className="muted">{period.label}</div></div>
        <div className="card" style={{padding:"1rem"}}><small className="muted">Pending Approvals</small><h3>8</h3><div className="muted">Avg 1.2 days</div></div>
      </div>
      {!canSeeFinance && (
        <div className="card" style={{padding:"1rem", marginTop:"1rem"}}>
          <strong>Limited view</strong>
          <div className="muted">Your role has restricted access per ECWA financial policy.</div>
        </div>
      )}
    </section>
  )
}


