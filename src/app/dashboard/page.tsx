"use client"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalExpenditures: 0,
    pendingApprovals: 0,
    totalIncome: 0,
    activeStaff: 0
  })

  useEffect(() => {
    // Fetch user data
    fetch('/api/me')
      .then(r => r.json())
      .then(data => setUser(data.user))
    
    // Mock stats - in real app, fetch from API
    setStats({
      totalExpenditures: 125000,
      pendingApprovals: 8,
      totalIncome: 180000,
      activeStaff: 24
    })
  }, [])

  const quickActions = [
    { title: "Raise Expenditure", href: "/expenditures/new", icon: "➕", color: "primary" },
    { title: "View Approvals", href: "/approvals", icon: "✅", color: "secondary" },
    { title: "Add Income", href: "/income", icon: "💰", color: "primary" },
    { title: "Generate Report", href: "/reports", icon: "📈", color: "secondary" },
    { title: "HR Management", href: "/hr", icon: "🧑‍💼", color: "secondary" },
    { title: "Settings", href: "/settings", icon: "⚙️", color: "ghost" }
  ]

  const recentActivities = [
    { action: "New expenditure raised", amount: "₦15,000", time: "2 hours ago", type: "expenditure" },
    { action: "Approval completed", amount: "₦8,500", time: "4 hours ago", type: "approval" },
    { action: "Income recorded", amount: "₦25,000", time: "1 day ago", type: "income" },
    { action: "Staff added", amount: "John Doe", time: "2 days ago", type: "hr" }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="section-title">
        <div>
          <h1 style={{fontSize:"2rem",margin:".25rem 0"}}>Dashboard</h1>
          <p className="muted">Welcome back, {user?.name || 'User'}! Here's your organization overview.</p>
        </div>
        <div className="badge" style={{padding:".5rem 1rem"}}>
          {user?.orgName || 'ECWA Organization'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid cols-4" style={{marginBottom:"2rem"}}>
        <div className="card" style={{padding:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:".75rem",marginBottom:".5rem"}}>
            <span style={{fontSize:"1.5rem"}}>🧾</span>
            <small className="muted">Total Expenditures</small>
          </div>
          <h2 style={{fontSize:"1.8rem",margin:0,color:"var(--danger)"}}>₦{stats.totalExpenditures.toLocaleString()}</h2>
        </div>
        
        <div className="card" style={{padding:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:".75rem",marginBottom:".5rem"}}>
            <span style={{fontSize:"1.5rem"}}>✅</span>
            <small className="muted">Pending Approvals</small>
          </div>
          <h2 style={{fontSize:"1.8rem",margin:0,color:"var(--warning)"}}>{stats.pendingApprovals}</h2>
        </div>
        
        <div className="card" style={{padding:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:".75rem",marginBottom:".5rem"}}>
            <span style={{fontSize:"1.5rem"}}>💰</span>
            <small className="muted">Total Income</small>
          </div>
          <h2 style={{fontSize:"1.8rem",margin:0,color:"var(--success)"}}>₦{stats.totalIncome.toLocaleString()}</h2>
        </div>
        
        <div className="card" style={{padding:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:".75rem",marginBottom:".5rem"}}>
            <span style={{fontSize:"1.5rem"}}>👥</span>
            <small className="muted">Active Staff</small>
          </div>
          <h2 style={{fontSize:"1.8rem",margin:0,color:"var(--primary)"}}>{stats.activeStaff}</h2>
        </div>
      </div>

      <div className="grid cols-2" style={{gap:"2rem"}}>
        {/* Quick Actions */}
        <div className="card" style={{padding:"1.5rem"}}>
          <h3 style={{margin:"0 0 1rem 0"}}>Quick Actions</h3>
          <div className="grid cols-2" style={{gap:".75rem"}}>
            {quickActions.map((action, index) => (
              <a 
                key={index}
                href={action.href}
                className={`btn ${action.color} block`}
                style={{justifyContent:"flex-start",padding:".75rem"}}
              >
                <span style={{marginRight:".5rem"}}>{action.icon}</span>
                {action.title}
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card" style={{padding:"1.5rem"}}>
          <h3 style={{margin:"0 0 1rem 0"}}>Recent Activities</h3>
          <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>
            {recentActivities.map((activity, index) => (
              <div key={index} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:".5rem",borderRadius:"8px",backgroundColor:"var(--surface)"}}>
                <div>
                  <div style={{fontWeight:"500"}}>{activity.action}</div>
                  <small className="muted">{activity.time}</small>
                </div>
                <div style={{fontWeight:"600",color:activity.type === 'income' ? 'var(--success)' : activity.type === 'expenditure' ? 'var(--danger)' : 'var(--primary)'}}>
                  {activity.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organization Info */}
      <div className="card" style={{padding:"1.5rem",marginTop:"2rem"}}>
        <h3 style={{margin:"0 0 1rem 0"}}>Organization Information</h3>
        <div className="grid cols-3" style={{gap:"1rem"}}>
          <div>
            <small className="muted">Organization Name</small>
            <div style={{fontWeight:"500"}}>{user?.orgName || 'ECWA Organization'}</div>
          </div>
          <div>
            <small className="muted">Your Role</small>
            <div style={{fontWeight:"500"}}>{user?.role || 'Member'}</div>
          </div>
          <div>
            <small className="muted">Member Since</small>
            <div style={{fontWeight:"500"}}>September 2025</div>
          </div>
        </div>
      </div>
    </div>
  )
}
