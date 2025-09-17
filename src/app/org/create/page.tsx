"use client"
import { useEffect, useState } from "react"

type Org = { id: string; name: string; type: string; parentId?: string }

export default function OrgCreatePage() {
  const [dccs, setDccs] = useState<Org[]>([])
  const [lccs, setLccs] = useState<Org[]>([])
  const [selectedDcc, setSelectedDcc] = useState<string>("")
  const [selectedLcc, setSelectedLcc] = useState<string>("")
  const [lcName, setLcName] = useState("")
  

  useEffect(() => {
    fetch("/api/org?type=DCC").then(r=>r.json()).then(d=>setDccs(d.items||[]))
  }, [])
  useEffect(() => {
    if (!selectedDcc) { setLccs([]); setSelectedLcc(""); return }
    fetch(`/api/org?type=LCC&parentId=${selectedDcc}`).then(r=>r.json()).then(d=>setLccs(d.items||[]))
  }, [selectedDcc])

  async function createLC() {
    if (!selectedLcc || !lcName) return
    const res = await fetch("/api/org", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ name: lcName, type: "LC", parentId: selectedLcc }) })
    if (res.ok) {
      const { org } = await res.json()
      // Attach org to current user and reissue token so topbar shows name
      await fetch('/api/me', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ orgId: org.id, orgName: org.name }) })
      window.location.href = "/settings"
    }
  }

  // Free-text DCC/LCC creation removed here to enforce dropdown-only selection

  return (
    <section className="container">
      <div className="card" style={{padding:"1rem"}}>
        <h3 style={{marginTop:0}}>Create Organization</h3>
        <div className="row">
          <div>
            <label>DCC</label>
            <select value={selectedDcc} onChange={(e)=>setSelectedDcc(e.target.value)}>
              <option value="">Select DCC</option>
              {dccs.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <label>LCC</label>
            <select value={selectedLcc} onChange={(e)=>setSelectedLcc(e.target.value)} disabled={!selectedDcc}>
              <option value="">Select LCC</option>
              {lccs.map(l=> <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <label>LC Name</label>
            <input value={lcName} onChange={(e)=>setLcName(e.target.value)} placeholder="ECWA • LC – ..." />
          </div>
          <div>
            <label>&nbsp;</label>
            <button className="btn primary" onClick={createLC}>Create LC</button>
          </div>
        </div>
      </div>
    </section>
  )
}


