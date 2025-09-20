"use client";

import { useState, useEffect } from 'react';
import { Organization, OrganizationLevel, Leader, getAvailablePositions, ORGANIZATION_NAMES } from '@/lib/organization';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'organizations' | 'leaders' | 'create-org' | 'add-leader'>('organizations');
  
  // Organization creation form
  const [orgForm, setOrgForm] = useState({
    name: '',
    level: 'DCC' as OrganizationLevel,
    parentId: '',
    secretaryDetails: {
      title: '',
      firstName: '',
      surname: '',
      otherNames: '',
      email: '',
      phone: '',
      position: ''
    }
  });

  // Leader addition form
  const [leaderForm, setLeaderForm] = useState({
    title: '',
    firstName: '',
    surname: '',
    otherNames: '',
    email: '',
    phone: '',
    position: '',
    organizationId: '',
    organizationLevel: 'DCC' as OrganizationLevel
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgsRes, leadersRes] = await Promise.all([
        fetch('/api/organizations'),
        fetch('/api/leaders')
      ]);

      if (!orgsRes.ok || !leadersRes.ok) {
        throw new Error('Failed to load data');
      }

      const orgsData = await orgsRes.json();
      const leadersData = await leadersRes.json();

      setOrganizations(orgsData.organizations || []);
      setLeaders(leadersData.leaders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }

      // Reset form
      setOrgForm({
        name: '',
        level: 'DCC',
        parentId: '',
        secretaryDetails: {
          title: '',
          firstName: '',
          surname: '',
          otherNames: '',
          email: '',
          phone: '',
          position: ''
        }
      });

      // Reload data
      await loadData();
      setActiveTab('organizations');
      alert('Organization created successfully! Verification code sent to secretary.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/leaders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaderForm)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add leader');
      }

      // Reset form
      setLeaderForm({
        title: '',
        firstName: '',
        surname: '',
        otherNames: '',
        email: '',
        phone: '',
        position: '',
        organizationId: '',
        organizationLevel: 'DCC'
      });

      // Reload data
      await loadData();
      setActiveTab('leaders');
      alert('Leader added successfully! Verification code sent to email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add leader');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableOrgNames = (level: OrganizationLevel) => {
    return ORGANIZATION_NAMES[level] || [];
  };

  const getFilteredOrganizations = (level: OrganizationLevel) => {
    return organizations.filter(org => org.level === level);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading organization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Organization Management</h1>
        <p>Manage ECWA organizational hierarchy and leaders</p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="tabs" style={{ marginBottom: '2rem' }}>
          <button 
            className={`tab ${activeTab === 'organizations' ? 'active' : ''}`}
            onClick={() => setActiveTab('organizations')}
          >
            Organizations
          </button>
          <button 
            className={`tab ${activeTab === 'leaders' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaders')}
          >
            Leaders
          </button>
          <button 
            className={`tab ${activeTab === 'create-org' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-org')}
          >
            Create Organization
          </button>
          <button 
            className={`tab ${activeTab === 'add-leader' ? 'active' : ''}`}
            onClick={() => setActiveTab('add-leader')}
          >
            Add Leader
          </button>
        </div>

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div>
            <h2>Organizations</h2>
            <div className="grid cols-3">
              {(['GCC', 'DCC', 'LCC', 'LC', 'PrayerHouse'] as OrganizationLevel[]).map(level => (
                <div key={level} className="card">
                  <h3>{level} Organizations</h3>
                  <p>Count: {getFilteredOrganizations(level).length}</p>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Secretary</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredOrganizations(level).map(org => (
                          <tr key={org.id}>
                            <td>{org.name}</td>
                            <td>{org.secretaryName || 'Not assigned'}</td>
                            <td>
                              <span className={`badge ${org.isActive ? 'success' : 'warning'}`}>
                                {org.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaders Tab */}
        {activeTab === 'leaders' && (
          <div>
            <h2>Leaders</h2>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Organization</th>
                    <th>Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map(leader => (
                    <tr key={leader.id}>
                      <td>{leader.title} {leader.firstName} {leader.surname}</td>
                      <td>{leader.email}</td>
                      <td>{leader.position}</td>
                      <td>
                        {organizations.find(org => org.id === leader.organizationId)?.name || 'Unknown'}
                      </td>
                      <td>{leader.organizationLevel}</td>
                      <td>
                        <span className={`badge ${
                          leader.verificationStatus === 'verified' ? 'success' : 
                          leader.verificationStatus === 'pending' ? 'warning' : 'danger'
                        }`}>
                          {leader.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Organization Tab */}
        {activeTab === 'create-org' && (
          <div>
            <h2>Create New Organization</h2>
            <form onSubmit={handleCreateOrganization} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Organization Name *</label>
                  <select
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({...orgForm, name: e.target.value})}
                    required
                  >
                    <option value="">Select Organization</option>
                    {getAvailableOrgNames(orgForm.level).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Organization Level *</label>
                  <select
                    value={orgForm.level}
                    onChange={(e) => setOrgForm({...orgForm, level: e.target.value as OrganizationLevel, name: ''})}
                    required
                  >
                    <option value="DCC">DCC</option>
                    <option value="LCC">LCC</option>
                    <option value="LC">LC</option>
                    <option value="PrayerHouse">Prayer House</option>
                  </select>
                </div>
              </div>

              <h3>Secretary Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={orgForm.secretaryDetails.title}
                    onChange={(e) => setOrgForm({
                      ...orgForm, 
                      secretaryDetails: {...orgForm.secretaryDetails, title: e.target.value}
                    })}
                    placeholder="Rev., Dr., Mr., Mrs., etc."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={orgForm.secretaryDetails.firstName}
                    onChange={(e) => setOrgForm({
                      ...orgForm, 
                      secretaryDetails: {...orgForm.secretaryDetails, firstName: e.target.value}
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Surname *</label>
                  <input
                    type="text"
                    value={orgForm.secretaryDetails.surname}
                    onChange={(e) => setOrgForm({
                      ...orgForm, 
                      secretaryDetails: {...orgForm.secretaryDetails, surname: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Other Names</label>
                  <input
                    type="text"
                    value={orgForm.secretaryDetails.otherNames}
                    onChange={(e) => setOrgForm({
                      ...orgForm, 
                      secretaryDetails: {...orgForm.secretaryDetails, otherNames: e.target.value}
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={orgForm.secretaryDetails.email}
                    onChange={(e) => setOrgForm({
                      ...orgForm, 
                      secretaryDetails: {...orgForm.secretaryDetails, email: e.target.value}
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={orgForm.secretaryDetails.phone}
                    onChange={(e) => setOrgForm({
                      ...orgForm, 
                      secretaryDetails: {...orgForm.secretaryDetails, phone: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Position *</label>
                <select
                  value={orgForm.secretaryDetails.position}
                  onChange={(e) => setOrgForm({
                    ...orgForm, 
                    secretaryDetails: {...orgForm.secretaryDetails, position: e.target.value}
                  })}
                  required
                >
                  <option value="">Select Position</option>
                  {getAvailablePositions(orgForm.level).map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Leader Tab */}
        {activeTab === 'add-leader' && (
          <div>
            <h2>Add New Leader</h2>
            <form onSubmit={handleAddLeader} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Organization *</label>
                  <select
                    value={leaderForm.organizationId}
                    onChange={(e) => {
                      const org = organizations.find(o => o.id === e.target.value);
                      setLeaderForm({
                        ...leaderForm, 
                        organizationId: e.target.value,
                        organizationLevel: org?.level || 'DCC'
                      });
                    }}
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name} ({org.level})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Position *</label>
                  <select
                    value={leaderForm.position}
                    onChange={(e) => setLeaderForm({...leaderForm, position: e.target.value})}
                    required
                  >
                    <option value="">Select Position</option>
                    {getAvailablePositions(leaderForm.organizationLevel).map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={leaderForm.title}
                    onChange={(e) => setLeaderForm({...leaderForm, title: e.target.value})}
                    placeholder="Rev., Dr., Mr., Mrs., etc."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={leaderForm.firstName}
                    onChange={(e) => setLeaderForm({...leaderForm, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Surname *</label>
                  <input
                    type="text"
                    value={leaderForm.surname}
                    onChange={(e) => setLeaderForm({...leaderForm, surname: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Other Names</label>
                  <input
                    type="text"
                    value={leaderForm.otherNames}
                    onChange={(e) => setLeaderForm({...leaderForm, otherNames: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={leaderForm.email}
                    onChange={(e) => setLeaderForm({...leaderForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={leaderForm.phone}
                    onChange={(e) => setLeaderForm({...leaderForm, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Leader'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}