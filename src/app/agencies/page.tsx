"use client"
import { useState } from "react"

export default function AgenciesPage(){
  const [items,setItems]=useState<string[]>(["Women Fellowship","Men Fellowship","Youth Fellowship","Choir","Band"]) 
  const [name,setName]=useState("")
  function add(){ if(!name) return; setItems([...items,name]); setName("") }
  return (
    <section className="container">
      <div className="section-title"><h2>Agencies & Groups</h2></div>
      <div className="card" style={{padding:'1rem'}}>
        <div className="row">
          <div><label>New Agency/Group</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Boys Brigade"/></div>
          <div style={{display:'flex',alignItems:'end'}}><button className="btn primary" onClick={add}>Add</button></div>
        </div>
        <ul style={{marginTop:'1rem'}}>
          {items.map((it)=> (
            <li key={it} className="badge" style={{marginRight:'.5rem',marginBottom:'.5rem',display:'inline-flex'}}>{it}</li>
          ))}
        </ul>
        <div className="muted">Leaders of agencies/groups can be assigned logins and scoped permissions in the next iteration.</div>
      </div>
    </section>
  )
}


