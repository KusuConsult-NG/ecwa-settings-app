"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { apiGet, apiPost } from "@/lib/fetch-utils"

export default function ClientTopbar() {
  const [me, setMe] = useState<any>(null)
  
  const fetchUser = async () => {
    try {
      const response = await apiGet('/api/me')
      const data = await response.json()
      setMe(data.user || null)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setMe(null)
    }
  }
  
  useEffect(() => { 
    fetchUser()
    
    // Listen for storage events (when user logs in/out in another tab)
    const handleStorageChange = () => {
      fetchUser()
    }
    
    // Listen for custom login event
    const handleUserLoggedIn = (event: CustomEvent) => {
      setMe(event.detail)
    }
    
    // Also listen for focus events to refresh user data when returning to tab
    const handleFocus = () => {
      fetchUser()
    }
    
    // Mobile menu toggle
    const handleMenuToggle = () => {
      const sidebar = document.querySelector('.sidebar')
      if (sidebar) {
        sidebar.classList.toggle('open')
      }
    }
    
    const menuBtn = document.getElementById('menuBtn')
    if (menuBtn) {
      menuBtn.addEventListener('click', handleMenuToggle)
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userLoggedIn', handleUserLoggedIn as EventListener)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      if (menuBtn) {
        menuBtn.removeEventListener('click', handleMenuToggle)
      }
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userLoggedIn', handleUserLoggedIn as EventListener)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])
  
  async function logout(){ 
    await apiPost('/api/auth/logout')
    setMe(null) // Clear user state immediately
    window.location.href='/' 
  }
  
  // Role-based access helpers
  const canCreateDCC = me?.role && ["President", "General Secretary", "Treasurer"].includes(me.role)
  
  return (
    <div className="topbar">
      <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
        <button id="menuBtn" className="btn ghost" aria-label="Toggle Menu">☰</button>
        <div className="badge"><Image src="/logo.svg" alt="ChurchFlow" width={20} height={20} /> {me?.name || 'ECWA SETTINGS'}</div>
      </div>
      <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
        {me && (
          <div className="text-sm" style={{marginRight:"1rem"}}>
            Hello, <span className="font-medium">{me?.name || 'User'}</span>
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
            <button className="btn ghost" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </div>
  )
}


