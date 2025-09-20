"use client"
import { useEffect, useState } from "react"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

type Org = { id: string; name: string; type: string; parentId?: string }

export default function CreateDccPage(){
  const [name,setName]=useState("")
  const [email,setEmail]=useState("")
  const [address,setAddress]=useState("")
  const [phone,setPhone]=useState("")
  const [dccs,setDccs]=useState<Org[]>([])
  const [loading,setLoading]=useState(false)

  useEffect(()=>{ fetch('/api/org?type=DCC').then(r=>r.json()).then(d=>setDccs(d.items||[])) },[])

  async function create(e: React.FormEvent){
    e.preventDefault()
    if(!name || !email) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/org',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          name, 
          type:'DCC',
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
        const list=await fetch('/api/org?type=DCC').then(r=>r.json())
        setDccs(list.items||[])
        alert(`DCC created successfully! Verification code sent to ${email}`)
      } else {
        const error = await res.json()
        alert(`Error: ${error.error || 'Failed to create DCC'}`)
      }
    } catch (error) {
      console.error('Error creating DCC:', error)
      alert('Failed to create DCC. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <div className="section-title"><h2>HQ: Create DCCs</h2></div>
      <div className="card" style={{padding:'1rem'}}>
        <form onSubmit={create}>
          <div className="row">
            <div>
              <label>DCC Name *</label>
              <input 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="ECWA Jos DCC"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label>Contact Email *</label>
              <input 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="admin@ecwa-jos-dcc.org"
                required
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
            <div style={{display:'flex',alignItems:'end'}}>
              <button 
                type="submit"
                className="btn primary" 
                disabled={loading || !name || !email}
              >
                {loading ? 'Creating...' : 'Create DCC'}
              </button>
            </div>
          </div>
        </form>
        <div style={{marginTop:'1rem'}} className="muted">Existing DCCs:</div>
        <ul style={{marginTop:'.25rem'}}>
          {dccs.map(d=> <li key={d.id} className="badge" style={{display:'inline-flex',marginRight:'.5rem',marginBottom:'.5rem'}}>{d.name}</li>)}
        </ul>
      </div>
    </section>
  )
}

 

