"use client"
import { useState, useEffect } from "react"

interface GroupRecord {
  id: string;
  name: string;
  type: 'agency' | 'group' | 'ministry' | 'department';
  description: string;
  leader: string;
  leaderEmail: string;
  leaderPhone: string;
  memberCount: number;
  establishedDate: string;
  status: 'active' | 'inactive' | 'suspended';
  meetingDay: string;
  meetingTime: string;
  meetingVenue: string;
  createdAt: string;
  updatedAt: string;
}

export default function AgenciesPage(){
  const [groups, setGroups] = useState<GroupRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'group' as 'agency' | 'group' | 'ministry' | 'department',
    description: '',
    leader: '',
    leaderEmail: '',
    leaderPhone: '',
    memberCount: 0,
    establishedDate: '',
    meetingDay: '',
    meetingTime: '',
    meetingVenue: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const groupTypes = [
    { value: 'agency', label: 'Agency' },
    { value: 'group', label: 'Group' },
    { value: 'ministry', label: 'Ministry' },
    { value: 'department', label: 'Department' }
  ]

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]

  // Mock data
  useEffect(() => {
    setGroups([
      {
        id: 'group1',
        name: 'Women Fellowship',
        type: 'group',
        description: 'Fellowship for women of all ages',
        leader: 'Mrs. Sarah Johnson',
        leaderEmail: 'sarah.johnson@ecwa.org',
        leaderPhone: '+234-801-234-5678',
        memberCount: 45,
        establishedDate: '2020-01-15',
        status: 'active',
        meetingDay: 'Saturday',
        meetingTime: '10:00 AM',
        meetingVenue: 'Church Hall',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'group2',
        name: 'Youth Fellowship',
        type: 'group',
        description: 'Fellowship for young people aged 18-35',
        leader: 'Rev. David Wilson',
        leaderEmail: 'david.wilson@ecwa.org',
        leaderPhone: '+234-802-345-6789',
        memberCount: 32,
        establishedDate: '2019-03-20',
        status: 'active',
        meetingDay: 'Friday',
        meetingTime: '6:00 PM',
        meetingVenue: 'Youth Center',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ])
    setLoading(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      if (editingId) {
        // Update existing group
        setGroups(prev => prev.map(g => 
          g.id === editingId 
            ? { ...g, ...formData, updatedAt: new Date().toISOString() }
            : g
        ))
      } else {
        // Create new group
        const newGroup: GroupRecord = {
          id: `group_${Date.now()}`,
          ...formData,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setGroups(prev => [...prev, newGroup])
      }
      
      setFormData({
        name: '',
        type: 'group',
        description: '',
        leader: '',
        leaderEmail: '',
        leaderPhone: '',
        memberCount: 0,
        establishedDate: '',
        meetingDay: '',
        meetingTime: '',
        meetingVenue: ''
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      setError('Failed to save group')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (group: GroupRecord) => {
    setFormData({
      name: group.name,
      type: group.type,
      description: group.description,
      leader: group.leader,
      leaderEmail: group.leaderEmail,
      leaderPhone: group.leaderPhone,
      memberCount: group.memberCount,
      establishedDate: group.establishedDate,
      meetingDay: group.meetingDay,
      meetingTime: group.meetingTime,
      meetingVenue: group.meetingVenue
    })
    setEditingId(group.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      setGroups(prev => prev.filter(g => g.id !== id))
    }
  }

  const handleStatusChange = (id: string, status: 'active' | 'inactive' | 'suspended') => {
    setGroups(prev => prev.map(g => 
      g.id === id 
        ? { ...g, status, updatedAt: new Date().toISOString() }
        : g
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--success)'
      case 'inactive': return 'var(--muted)'
      case 'suspended': return 'var(--danger)'
      default: return 'var(--muted)'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agency': return '#3B82F6'
      case 'group': return '#10B981'
      case 'ministry': return '#F59E0B'
      case 'department': return '#8B5CF6'
      default: return 'var(--muted)'
    }
  }

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Groups & Agencies</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading groups...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Groups & Agencies</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Group/Agency'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{marginBottom: '1rem'}}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>
            {editingId ? 'Edit Group/Agency' : 'Add New Group/Agency'}
          </h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  required
                  placeholder="Enter group/agency name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Type *</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({...prev, type: e.target.value as 'agency' | 'group' | 'ministry' | 'department'}))}
                  required
                >
                  {groupTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                placeholder="Enter group description"
                rows={3}
              />
            </div>

            <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>Leader Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="leader">Leader Name *</label>
                <input
                  type="text"
                  id="leader"
                  value={formData.leader}
                  onChange={(e) => setFormData(prev => ({...prev, leader: e.target.value}))}
                  required
                  placeholder="Enter leader name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="leaderEmail">Leader Email</label>
                <input
                  type="email"
                  id="leaderEmail"
                  value={formData.leaderEmail}
                  onChange={(e) => setFormData(prev => ({...prev, leaderEmail: e.target.value}))}
                  placeholder="Enter leader email"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="leaderPhone">Leader Phone</label>
                <input
                  type="tel"
                  id="leaderPhone"
                  value={formData.leaderPhone}
                  onChange={(e) => setFormData(prev => ({...prev, leaderPhone: e.target.value}))}
                  placeholder="Enter leader phone"
                />
              </div>
              <div className="form-group">
                <label htmlFor="memberCount">Member Count</label>
                <input
                  type="number"
                  id="memberCount"
                  value={formData.memberCount}
                  onChange={(e) => setFormData(prev => ({...prev, memberCount: parseInt(e.target.value) || 0}))}
                  min="0"
                  placeholder="Enter member count"
                />
              </div>
            </div>

            <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>Meeting Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="meetingDay">Meeting Day</label>
                <select
                  id="meetingDay"
                  value={formData.meetingDay}
                  onChange={(e) => setFormData(prev => ({...prev, meetingDay: e.target.value}))}
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="meetingTime">Meeting Time</label>
                <input
                  type="time"
                  id="meetingTime"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData(prev => ({...prev, meetingTime: e.target.value}))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="meetingVenue">Meeting Venue</label>
                <input
                  type="text"
                  id="meetingVenue"
                  value={formData.meetingVenue}
                  onChange={(e) => setFormData(prev => ({...prev, meetingVenue: e.target.value}))}
                  placeholder="Enter meeting venue"
                />
              </div>
              <div className="form-group">
                <label htmlFor="establishedDate">Established Date</label>
                <input
                  type="date"
                  id="establishedDate"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData(prev => ({...prev, establishedDate: e.target.value}))}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    name: '',
                    type: 'group',
                    description: '',
                    leader: '',
                    leaderEmail: '',
                    leaderPhone: '',
                    memberCount: 0,
                    establishedDate: '',
                    meetingDay: '',
                    meetingTime: '',
                    meetingVenue: ''
                  })
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingId ? 'Update Group' : 'Add Group')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Groups & Agencies ({groups.length})</h3>
        
        {groups.length === 0 ? (
          <p>No groups found. Add one using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Leader</th>
                  <th>Members</th>
                  <th>Meeting</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <strong>{group.name}</strong>
                      {group.description && (
                        <div style={{fontSize: '12px', color: 'var(--muted)', marginTop: '4px'}}>
                          {group.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getTypeColor(group.type),
                          color: 'white'
                        }}
                      >
                        {group.type}
                      </span>
                    </td>
                    <td>
                      <div>{group.leader}</div>
                      {group.leaderEmail && (
                        <div style={{fontSize: '12px', color: 'var(--muted)'}}>
                          {group.leaderEmail}
                        </div>
                      )}
                    </td>
                    <td>{group.memberCount}</td>
                    <td>
                      {group.meetingDay && group.meetingTime ? (
                        <div>
                          <div>{group.meetingDay}</div>
                          <div style={{fontSize: '12px', color: 'var(--muted)'}}>
                            {group.meetingTime}
                          </div>
                        </div>
                      ) : (
                        <span style={{color: 'var(--muted)'}}>-</span>
                      )}
                    </td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(group.status),
                          color: 'white'
                        }}
                      >
                        {group.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(group)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(group.id)}
                        >
                          Delete
                        </button>
                        {group.status === 'active' && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(group.id, 'inactive')}
                          >
                            Deactivate
                          </button>
                        )}
                        {group.status === 'inactive' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(group.id, 'active')}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleStatusChange(group.id, 'suspended')}
                        >
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}


