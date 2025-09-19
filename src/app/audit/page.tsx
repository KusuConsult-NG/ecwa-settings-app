"use client"
import { useState, useEffect } from "react"

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    userId: '',
    startDate: '',
    endDate: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const actions = [
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'IMPORT'
  ]

  const resources = [
    'User', 'Staff', 'Payroll', 'Leave', 'Query', 'LCC', 'LC', 'Agency', 'Bank', 'Report'
  ]

  // Fetch data from API
  useEffect(() => {
    fetchAuditLogs()
  }, [filters, currentPage])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.resource) params.append('resource', filters.resource)
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      params.append('page', currentPage.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/audit?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setAuditLogs(data.logs || [])
        setTotalPages(data.summary.totalPages || 1)
      } else {
        setError(data.error || 'Failed to fetch audit logs')
      }
    } catch (err) {
      setError('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'var(--success)'
      case 'UPDATE': return 'var(--info)'
      case 'DELETE': return 'var(--danger)'
      case 'LOGIN': return 'var(--primary)'
      case 'LOGOUT': return 'var(--muted)'
      case 'VIEW': return 'var(--warning)'
      default: return 'var(--muted)'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return '➕'
      case 'UPDATE': return '✏️'
      case 'DELETE': return '🗑️'
      case 'LOGIN': return '🔐'
      case 'LOGOUT': return '🚪'
      case 'VIEW': return '👁️'
      case 'EXPORT': return '📤'
      case 'IMPORT': return '📥'
      default: return '📝'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading audit logs...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Audit Logs</h1>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <h3>Filters</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            >
              <option value="">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Resource</label>
            <select
              value={filters.resource}
              onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
            >
              <option value="">All Resources</option>
              {resources.map(resource => (
                <option key={resource} value={resource}>{resource}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              placeholder="Filter by user ID..."
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <button 
              className="btn btn-secondary"
              onClick={() => setFilters({ action: '', resource: '', userId: '', startDate: '', endDate: '' })}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card">
        <h2>Audit Logs ({auditLogs.length})</h2>
        {auditLogs.length === 0 ? (
          <div className="empty-state">
            <p>No audit logs found.</p>
          </div>
        ) : (
          <>
            <div className="audit-logs">
              {auditLogs.map(log => (
                <div key={log.id} className="audit-log-item">
                  <div className="audit-log-header">
                    <div className="audit-log-action">
                      <span className="action-icon">{getActionIcon(log.action)}</span>
                      <span 
                        className="action-badge"
                        style={{ backgroundColor: getActionColor(log.action) }}
                      >
                        {log.action}
                      </span>
                      <span className="resource-badge">{log.resource}</span>
                    </div>
                    <div className="audit-log-time">
                      <span className="time-ago">{getTimeAgo(log.timestamp)}</span>
                      <span className="time-full">{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="audit-log-body">
                    <div className="audit-log-user">
                      <strong>{log.userName}</strong>
                      <span className="user-email">({log.userEmail})</span>
                    </div>
                    
                    {log.resourceId && (
                      <div className="audit-log-resource">
                        <strong>Resource ID:</strong> {log.resourceId}
                      </div>
                    )}
                    
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="audit-log-details">
                        <strong>Details:</strong>
                        <pre className="details-json">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div className="audit-log-meta">
                      <span className="ip-address">IP: {log.ipAddress}</span>
                      <span className="user-agent">
                        {log.userAgent.length > 50 
                          ? `${log.userAgent.substring(0, 50)}...` 
                          : log.userAgent
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="btn btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button 
                  className="btn btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .audit-logs {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .audit-log-item {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }
        
        .audit-log-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .audit-log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .audit-log-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .action-icon {
          font-size: 1.2rem;
        }
        
        .action-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .resource-badge {
          padding: 0.25rem 0.5rem;
          background: var(--background-secondary);
          color: var(--text-secondary);
          border-radius: 0.25rem;
          font-size: 0.8rem;
        }
        
        .audit-log-time {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }
        
        .time-ago {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .time-full {
          font-size: 0.8rem;
          color: var(--muted);
        }
        
        .audit-log-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .audit-log-user {
          font-size: 1.1rem;
        }
        
        .user-email {
          color: var(--text-secondary);
          font-weight: normal;
          margin-left: 0.5rem;
        }
        
        .audit-log-resource {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .audit-log-details {
          margin-top: 0.5rem;
        }
        
        .details-json {
          background: var(--background-secondary);
          padding: 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
          overflow-x: auto;
        }
        
        .audit-log-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 0.5rem;
        }
        
        .ip-address {
          font-family: monospace;
        }
        
        .user-agent {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        
        .pagination-info {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
        }
      `}</style>
    </div>
  )
}