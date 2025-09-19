"use client"
import { useState, useEffect } from "react"

const userRoles = [
  {
    id: "ROLE001",
    name: "John Doe",
    email: "john.doe@church.org",
    role: "Senior Minister",
    status: "Active",
    lastLogin: "2024-01-15",
  },
  {
    id: "ROLE002",
    name: "Mary Johnson",
    email: "mary.johnson@church.org",
    role: "Financial Secretary",
    status: "Active",
    lastLogin: "2024-01-15",
  },
  {
    id: "ROLE003",
    name: "David Wilson",
    email: "david.wilson@church.org",
    role: "Youth Pastor",
    status: "Active",
    lastLogin: "2024-01-14",
  },
  {
    id: "ROLE004",
    name: "Sarah Brown",
    email: "sarah.brown@church.org",
    role: "Secretary",
    status: "On Leave",
    lastLogin: "2024-01-10",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <span className="badge" style={{backgroundColor: 'var(--success)', color: 'white'}}>Active</span>
    case "On Leave":
      return <span className="badge" style={{backgroundColor: 'var(--warning)', color: 'white'}}>On Leave</span>
    case "Inactive":
      return <span className="badge" style={{backgroundColor: 'var(--danger)', color: 'white'}}>Inactive</span>
    default:
      return <span className="badge" style={{backgroundColor: 'var(--muted)', color: 'white'}}>{status}</span>
  }
}

export default function UserRolesPage() {
  const [mounted, setMounted] = useState(false)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: ""
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // This would need a proper user creation API
      alert('User creation functionality needs to be implemented')
      setIsAddUserDialogOpen(false)
      setNewUserData({ firstName: "", lastName: "", email: "", role: "" })
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Failed to add user')
    }
  }

  if (!mounted) {
    return (
      <section className="container">
        <div className="section-title"><h2>User Role Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>User Role Management</h2>
        <p>Manage user accounts and their roles within the organization</p>
      </div>

      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <div>
            <h3>User Accounts</h3>
            <p style={{color: 'var(--muted)', margin: '0.5rem 0 0'}}>Manage user accounts and their roles within the organization</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAddUserDialogOpen(true)}
          >
            + Add User
          </button>
        </div>
        
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userRoles.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <div className="btn-group">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => alert(`Edit ${user.name} - Feature coming soon`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                            alert(`Delete ${user.name} - Feature coming soon`)
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Dialog */}
      {isAddUserDialogOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-card)',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{marginBottom: '1rem'}}>Add New User</h3>
            <p style={{color: 'var(--muted)', marginBottom: '1.5rem'}}>Create a new user account with role assignment</p>
            
            <form onSubmit={handleAddUser} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input 
                    id="firstName" 
                    placeholder="John"
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData(prev => ({...prev, firstName: e.target.value}))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input 
                    id="lastName" 
                    placeholder="Doe"
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData(prev => ({...prev, lastName: e.target.value}))}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="userEmail">Email Address</label>
                <input 
                  id="userEmail" 
                  type="email" 
                  placeholder="user@church.org"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="userRole">Role</label>
                <select 
                  value={newUserData.role}
                  onChange={(e) => setNewUserData(prev => ({...prev, role: e.target.value}))}
                  required
                >
                  <option value="">Select role</option>
                  <option value="senior-minister">Senior Minister</option>
                  <option value="assistant-pastor">Assistant Pastor</option>
                  <option value="financial-secretary">Financial Secretary</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="secretary">Secretary</option>
                  <option value="cel">CEL</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsAddUserDialogOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
