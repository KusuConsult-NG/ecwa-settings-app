"use client"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function ClientTopbar() {
  const [me, setMe] = useState<any>(null)
  useEffect(() => { fetch('/api/me').then(r=>r.json()).then(d=>setMe(d.user||null)) }, [])
  async function logout(){ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/' }
  
  // Role-based access helpers
  const canCreateDCC = me?.role && ["President", "General Secretary", "Treasurer"].includes(me.role)
  const canCreateLCC = me?.role && ["President", "General Secretary", "Treasurer", "Chairman", "Secretary"].includes(me.role)
  const canCreateLC = me?.role && ["President", "General Secretary", "Treasurer", "Chairman", "Secretary", "LO"].includes(me.role)
  
  return (
    <div className="topbar">
      <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
        <button id="menuBtn" className="btn ghost" aria-label="Toggle Menu">☰</button>
        <div className="badge"><Image src="/logo.svg" alt="ChurchFlow" width={20} height={20} /> {me?.name || 'CHURCHFLOW'}</div>
      </div>
      <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
        {me && (
          <div className="text-sm" style={{marginRight:"1rem"}}>
            Hello, <span className="font-medium">{me.name || 'User'}</span>
          </div>
        )}
        {!me ? (
          <>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="btn secondary" href="/signup">Sign Up</a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="btn primary" href="/login">Log In</a>
          </>
        ) : (
          <>
            {canCreateDCC && (
              /* eslint-disable-next-line @next/next/no-html-link-for-pages */
              <a className="btn secondary" href="/org/dcc">Create DCC</a>
            )}
            {canCreateLCC && (
              /* eslint-disable-next-line @next/next/no-html-link-for-pages */
              <a className="btn secondary" href="/org/lcc">Create LCC</a>
            )}
            {canCreateLC && (
              /* eslint-disable-next-line @next/next/no-html-link-for-pages */
              <a className="btn secondary" href="/org/create">Create LC</a>
            )}
            <button className="btn ghost" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </div>
  )
}


