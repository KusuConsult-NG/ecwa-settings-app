"use client"
import { useState, useEffect } from "react"

interface AuditLog {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
  ipAddress: string
  userAgent: string
}

export default function AuditPage(){
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      // Simulate API call - in real app, this would fetch actual audit logs
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock audit log data
      const mockLogs: AuditLog[] = [
        {
          id: "1",
          action: "LOGIN",
          user: "admin@example.com",
          timestamp: "2024-09-18T10:30:00Z",
          details: "User logged in successfully",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        },
        {
          id: "2",
          action: "EXPENDITURE_CREATED",
          user: "admin@example.com",
          timestamp: "2024-09-18T10:25:00Z",
          details: "Created expenditure: Roof repair - ₦25,000",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        },
        {
          id: "3",
          action: "EXPENDITURE_APPROVED",
          user: "admin@example.com",
          timestamp: "2024-09-18T10:20:00Z",
          details: "Approved expenditure: Office supplies - ₦8,000",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        },
        {
          id: "4",
          action: "INCOME_RECORDED",
          user: "admin@example.com",
          timestamp: "2024-09-18T10:15:00Z",
          details: "Recorded income: Tithe from John A. - ₦15,000",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        },
        {
          id: "5",
          action: "USER_CREATED",
          user: "admin@example.com",
          timestamp: "2024-09-18T10:10:00Z",
          details: "Created new user: secretary@church.org",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        },
        {
          id: "6",
          action: "LOGOUT",
          user: "secretary@church.org",
          timestamp: "2024-09-18T09:45:00Z",
          details: "User logged out",
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        {
          id: "7",
          action: "EXPENDITURE_REJECTED",
          user: "admin@example.com",
          timestamp: "2024-09-18T09:30:00Z",
          details: "Rejected expenditure: Unnecessary equipment - ₦50,000 (Reason: Not in budget)",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        },
        {
          id: "8",
          action: "SETTINGS_UPDATED",
          user: "admin@example.com",
          timestamp: "2024-09-18T09:15:00Z",
          details: "Updated organization settings",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        }
      ]

      setAuditLogs(mockLogs)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'var(--success)'
      case 'LOGOUT':
        return 'var(--muted)'
      case 'EXPENDITURE_CREATED':
      case 'INCOME_RECORDED':
        return 'var(--primary)'
      case 'EXPENDITURE_APPROVED':
        return 'var(--success)'
      case 'EXPENDITURE_REJECTED':
        return 'var(--danger)'
      case 'USER_CREATED':
        return 'var(--secondary)'
      case 'SETTINGS_UPDATED':
        return 'var(--warning)'
      default:
        return 'var(--muted)'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return '🔐'
      case 'LOGOUT':
        return '🚪'
      case 'EXPENDITURE_CREATED':
        return '➕'
      case 'EXPENDITURE_APPROVED':
        return '✅'
      case 'EXPENDITURE_REJECTED':
        return '❌'
      case 'INCOME_RECORDED':
        return '💰'
      case 'USER_CREATED':
        return '👤'
      case 'SETTINGS_UPDATED':
        return '⚙️'
      default:
        return '📝'
    }
  }

  // Filter logs based on search term and action filter
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterAction === "all" || log.action === filterAction
    
    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLogs = filteredLogs.slice(startIndex, endIndex)

  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)))

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Audit Logs</h2></div>
        <div className="card" style={{padding:'1rem', textAlign: 'center'}}>
          Loading audit logs...
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Audit Logs</h2>
        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
          <button 
            className="btn secondary" 
            onClick={fetchAuditLogs}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{padding:'1rem', marginBottom:'1rem'}}>
        <div className="row" style={{flexWrap: 'wrap', gap: '1rem'}}>
          <div style={{flex: '1', minWidth: '200px'}}>
            <label>Search</label>
            <input 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{minWidth: '150px'}}>
            <label>Action Filter</label>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)}>
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {getActionIcon(action)} {action.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card" style={{padding:'0'}}>
        {error ? (
          <div style={{padding: '1rem', color: '#FCA5A5', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)'}}>
            Error: {error}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{padding: '2rem', textAlign: 'center'}}>
            <p className="muted">
              {searchTerm || filterAction !== "all" ? 'No audit logs found matching your criteria.' : 'No audit logs found.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)'}}>
                    <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Action</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>User</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Details</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>Timestamp</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontWeight: '600'}}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log) => (
                    <tr key={log.id} style={{borderBottom: '1px solid var(--border)'}}>
                      <td style={{padding: '1rem'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <span style={{fontSize: '1.2rem'}}>{getActionIcon(log.action)}</span>
                          <span 
                            className="badge" 
                            style={{
                              backgroundColor: getActionColor(log.action),
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td style={{padding: '1rem', fontWeight: '500'}}>
                        {log.user}
                      </td>
                      <td style={{padding: '1rem', maxWidth: '300px'}}>
                        <div style={{fontSize: '0.875rem'}}>{log.details}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem'}}>
                          {log.userAgent}
                        </div>
                      </td>
                      <td style={{padding: '1rem', fontSize: '0.875rem', color: 'var(--muted)'}}>
                        {formatDate(log.timestamp)}
                      </td>
                      <td style={{padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--muted)'}}>
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)'}}>
                <div style={{fontSize: '0.875rem', color: 'var(--muted)'}}>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} logs
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button 
                    className="btn ghost" 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{fontSize: '0.875rem'}}
                  >
                    Previous
                  </button>
                  <span style={{padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--muted)'}}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    className="btn ghost" 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{fontSize: '0.875rem'}}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

 

