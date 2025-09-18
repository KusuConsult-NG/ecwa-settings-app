"use client"
import { useEffect, useState } from "react"

type Org = { id: string; name: string; type: string; parentId?: string }

export default function CreateLccPage(){
  const [dccs,setDccs]=useState<Org[]>([])
  const [selectedDcc,setSelectedDcc]=useState<string>("")
  const [name,setName]=useState("")
  const [lccs,setLccs]=useState<Org[]>([])

  useEffect(()=>{ fetch('/api/org?type=DCC').then(r=>r.json()).then(d=>setDccs(d.items||[])) },[])
  useEffect(()=>{ if(!selectedDcc){ setLccs([]); return } fetch(`/api/org?type=LCC&parentId=${selectedDcc}`).then(r=>r.json()).then(d=>setLccs(d.items||[])) },[selectedDcc])

  async function create(){
    if(!name || !selectedDcc) return
    const res = await fetch('/api/org',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name, type:'LCC', parentId:selectedDcc})})
    if(res.ok){ setName(""); const list=await fetch(`/api/org?type=LCC&parentId=${selectedDcc}`).then(r=>r.json()); setLccs(list.items||[]) }
  }

  return (
    <section className="container">
      <div className="section-title"><h2>DCC: Create LCCs</h2></div>
      <div className="card" style={{padding:'1rem'}}>
        <div className="row">
          <div>
            <label>DCC</label>
            <select value={selectedDcc} onChange={e=>setSelectedDcc(e.target.value)}>
              <option value="">Select DCC</option>
              {dccs.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label>New LCC Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="ECWA … LCC"/>
          </div>
          <div style={{display:'flex',alignItems:'end'}}>
            <button className="btn primary" onClick={create} disabled={!selectedDcc || !name}>Create LCC</button>
          </div>
        </div>
        <div style={{marginTop:'1rem'}} className="muted">Existing LCCs in selected DCC:</div>
        <ul style={{marginTop:'.25rem'}}>
          {lccs.map(l=> <li key={l.id} className="badge" style={{display:'inline-flex',marginRight:'.5rem',marginBottom:'.5rem'}}>{l.name}</li>)}
        </ul>
      </div>
    </section>
  )
}

 

