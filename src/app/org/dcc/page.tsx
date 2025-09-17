"use client"
import { useEffect, useState } from "react"

type Org = { id: string; name: string; type: string; parentId?: string }

export default function CreateDccPage(){
  const [name,setName]=useState("")
  const [dccs,setDccs]=useState<Org[]>([])

  useEffect(()=>{ fetch('/api/org?type=DCC').then(r=>r.json()).then(d=>setDccs(d.items||[])) },[])

  async function create(){
    if(!name) return
    const res = await fetch('/api/org',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name, type:'DCC'})})
    if(res.ok){ setName(""); const list=await fetch('/api/org?type=DCC').then(r=>r.json()); setDccs(list.items||[]) }
  }

  return (
    <section className="container">
      <div className="section-title"><h2>HQ: Create DCCs</h2></div>
      <div className="card" style={{padding:'1rem'}}>
        <div className="row">
          <div><label>New DCC Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="ECWA … DCC"/></div>
          <div style={{display:'flex',alignItems:'end'}}><button className="btn primary" onClick={create}>Create DCC</button></div>
        </div>
        <div style={{marginTop:'1rem'}} className="muted">Existing DCCs:</div>
        <ul style={{marginTop:'.25rem'}}>
          {dccs.map(d=> <li key={d.id} className="badge" style={{display:'inline-flex',marginRight:'.5rem',marginBottom:'.5rem'}}>{d.name}</li>)}
        </ul>
      </div>
    </section>
  )
}

 

