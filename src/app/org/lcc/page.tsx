"use client"
import { useEffect, useState } from "react"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

type Org = { id: string; name: string; type: string; parentId?: string }

export default function CreateLccPage(){
  const [name,setName]=useState("")
  const [email,setEmail]=useState("")
  const [address,setAddress]=useState("")
  const [phone,setPhone]=useState("")
  const [selectedDcc,setSelectedDcc]=useState("")
  const [dccs,setDccs]=useState<Org[]>([])
  const [lccs,setLccs]=useState<Org[]>([])
  const [loading,setLoading]=useState(false)

  useEffect(()=>{ 
    fetch('/api/org?type=DCC').then(r=>r.json()).then(d=>setDccs(d.items||[])) 
  },[])

  useEffect(()=>{ 
    if(selectedDcc) {
      fetch(`/api/org?type=LCC&parentId=${selectedDcc}`).then(r=>r.json()).then(d=>setLccs(d.items||[]))
    } else {
      setLccs([])
    }
  },[selectedDcc])

  async function create(e: React.FormEvent){
    e.preventDefault()
    if(!name || !email || !selectedDcc) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/org',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          name, 
          type:'LCC',
          parentId: selectedDcc,
          email: email.trim(),
          address: address || undefined,
          phone: phone || undefined
        })
      })
      
      if(res.ok){ 
        const { org } = await res.json()
        setName("")
        setEmail("")
        setAddress("")
        setPhone("")
        setSelectedDcc("")
        const list=await fetch(`/api/org?type=LCC&parentId=${selectedDcc}`).then(r=>r.json())
        setLccs(list.items||[])
        alert(`LCC created successfully! Verification code sent to ${email}`)
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to create LCC'}`)
      }
    } catch (error) {
      console.error('Error creating LCC:', error)
      alert('Failed to create LCC. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="section-title"><h2>Create LCCs</h2></div>
      <div className="card" style={{padding:'1rem'}}>
        <form onSubmit={create}>
          <div className="row">
            <div>
              <label>DCC *</label>
              <select 
                value={selectedDcc} 
                onChange={(e)=>setSelectedDcc(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select DCC</option>
                {dccs.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label>LCC Name *</label>
              <input 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="ECWA Jos Central LCC"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Contact Email *</label>
              <input 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="admin@ecwa-jos-central-lcc.org"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label>Phone</label>
              <input 
                value={phone} 
                onChange={e=>setPhone(e.target.value)} 
                placeholder="+234 803 123 4567"
                disabled={loading}
              />
            </div>
          </div>
          <div className="row">
            <div>
              <label>Address</label>
              <input 
                value={address} 
                onChange={e=>setAddress(e.target.value)} 
                placeholder="123 Church Street, Jos, Plateau State"
                disabled={loading}
              />
            </div>
            <div style={{display:'flex',alignItems:'end'}}>
              <button 
                type="submit"
                className="btn primary" 
                disabled={loading || !name || !email || !selectedDcc}
              >
                {loading ? 'Creating...' : 'Create LCC'}
              </button>
            </div>
          </div>
        </form>
        {selectedDcc && (
          <div style={{marginTop:'1rem'}} className="muted">
            Existing LCCs in {dccs.find(d => d.id === selectedDcc)?.name}:
          </div>
        )}
        <ul style={{marginTop:'.25rem'}}>
          {lccs.map(l=> <li key={l.id} className="badge" style={{display:'inline-flex',marginRight:'.5rem',marginBottom:'.5rem'}}>{l.name}</li>)}
        </ul>
      </div>
    </section>
  )
}