"use client"
import { useEffect, useState } from "react"

type Org = { id: string; name: string; type: string; parentId?: string }

export default function OrgCreatePage() {
  const [dccs, setDccs] = useState<Org[]>([])
  const [lccs, setLccs] = useState<Org[]>([])
  const [selectedDcc, setSelectedDcc] = useState<string>("")
  const [selectedLcc, setSelectedLcc] = useState<string>("")
  const [lcName, setLcName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    fetch("/api/org?type=DCC").then(r=>r.json()).then(d=>setDccs(d.items||[]))
  }, [mounted])
  
  useEffect(() => {
    if (!mounted || !selectedDcc) { setLccs([]); setSelectedLcc(""); return }
    fetch(`/api/org?type=LCC&parentId=${selectedDcc}`).then(r=>r.json()).then(d=>setLccs(d.items||[]))
  }, [selectedDcc, mounted])

  async function createLC(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedLcc || !lcName) return
    
    try {
      const res = await fetch("/api/org", { 
        method: "POST", 
        headers: { "Content-Type":"application/json" }, 
        body: JSON.stringify({ 
          name: lcName, 
          type: "LC", 
          parentId: selectedLcc,
          address: address || undefined,
          phone: phone || undefined
        }) 
      })
      
      if (res.ok) {
        const { org } = await res.json()
        // Attach org to current user and reissue token so topbar shows name
        await fetch('/api/me', { 
          method:'POST', 
          headers:{'Content-Type':'application/json'}, 
          body: JSON.stringify({ 
            orgId: org.id, 
            orgName: org.name,
            role: "admin" // Give admin privileges to the creator
          }) 
        })
        window.location.href = "/settings"
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to create organization'}`)
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Failed to create organization. Please try again.')
    }
  }

  if (!mounted) {
    return (
      <section className="container">
        <div className="card" style={{padding:"1rem", backgroundColor: "transparent"}}>
          <h3 style={{marginTop:0, color: "white"}}>Create Organization</h3>
          <form className="row">
            <div>
              <label >DCC</label>
              <select disabled>
                <option value="">Loading...</option>
              </select>
            </div>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="org container">
      <div className="card" style={{padding:"1rem", backgroundColor: "transparent"}}>
        <h3 style={{marginTop:0, color: "white"}}>Create Organization</h3>
        <form onSubmit={createLC}>
          <div className="row">
            <div>
              <label >DCC *</label>
              <select 
                value={selectedDcc} 
                onChange={(e)=>setSelectedDcc(e.target.value)}
                required
              >
                <option value="">Select DCC</option>
                {dccs.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div>
              <label >LCC *</label>
              <select 
                value={selectedLcc} 
                onChange={(e)=>setSelectedLcc(e.target.value)} 
                disabled={!selectedDcc}
                required
              >
                <option value="">Select LCC</option>
                {lccs.map(l=> <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div>
              <label >LC Name *</label>
              <input 
                value={lcName} 
                onChange={(e)=>setLcName(e.target.value)} 
                placeholder="ECWA • LC – ..." 
                required
              />
            </div>
          </div>
          <div className="row">
            <div>
              <label >Address</label>
              <input 
                value={address} 
                onChange={(e)=>setAddress(e.target.value)} 
                placeholder="123 Church Street, City, State"
              />
            </div>
            <div>
              <label >Phone</label>
              <input 
                value={phone} 
                onChange={(e)=>setPhone(e.target.value)} 
                placeholder="+234 803 123 4567"
              />
            </div>
          </div>
          <div className="row">
            <div>
              <label>&nbsp;</label>
              <button type="submit" className="btn primary">Create LC</button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}


