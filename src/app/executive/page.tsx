'use client';

import { useState, useEffect } from 'react';
import { ExecutiveRecord, EXECUTIVE_POSITIONS, EXECUTIVE_STATUSES, getStatusColor, getStatusIcon } from '@/lib/executive';

export default function ExecutivePage() {
  const [executives, setExecutives] = useState<ExecutiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    dateOfAppointment: '',
    termLength: 24,
    qualifications: '',
    previousExperience: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch executives
  const fetchExecutives = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/executives');
      const data = await response.json();
      
      if (data.success) {
        setExecutives(data.executives);
      } else {
        setError(data.error || 'Failed to fetch executives');
      }
    } catch (err) {
      setError('Failed to fetch executives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/executives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Executive added successfully!');
        setFormData({
          name: '',
          position: '',
          email: '',
          phone: '',
          address: '',
          dateOfBirth: '',
          dateOfAppointment: '',
          termLength: 24,
          qualifications: '',
          previousExperience: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        });
        setShowForm(false);
        fetchExecutives(); // Refresh the list
      } else {
        setError(data.error || 'Failed to add executive');
      }
    } catch (err) {
      setError('Failed to add executive');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Update executive status
  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/executives/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        fetchExecutives(); // Refresh the list
      } else {
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) {
    return (
      <section className="container">
        <div className="section-title"><h2>Executive Management</h2></div>
        <div className="card" style={{padding:'1rem'}}>
          <p>Loading executives...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="section-title">
        <h2>Executive Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Executive'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{marginBottom: '1rem'}}>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success" style={{marginBottom: '1rem'}}>
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>Add New Executive</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="position">Position *</label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Position</option>
                  {EXECUTIVE_POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter full address"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfAppointment">Date of Appointment *</label>
                <input
                  type="date"
                  id="dateOfAppointment"
                  name="dateOfAppointment"
                  value={formData.dateOfAppointment}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="termLength">Term Length (months)</label>
                <input
                  type="number"
                  id="termLength"
                  name="termLength"
                  value={formData.termLength}
                  onChange={handleInputChange}
                  min="1"
                  max="60"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="qualifications">Qualifications</label>
              <textarea
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="Enter educational qualifications and certifications"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="previousExperience">Previous Experience</label>
              <textarea
                id="previousExperience"
                name="previousExperience"
                value={formData.previousExperience}
                onChange={handleInputChange}
                placeholder="Enter previous church leadership experience"
                rows={3}
              />
            </div>

            <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>Emergency Contact</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContact.name">Contact Name</label>
                <input
                  type="text"
                  id="emergencyContact.name"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyContact.phone">Contact Phone</label>
                <input
                  type="tel"
                  id="emergencyContact.phone"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact phone"
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyContact.relationship">Relationship</label>
                <input
                  type="text"
                  id="emergencyContact.relationship"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleInputChange}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Executive'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom: '1rem'}}>Executive List ({executives.length})</h3>
        
        {executives.length === 0 ? (
          <p>No executives found. Add one using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Appointment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {executives.map((executive) => (
                  <tr key={executive.id}>
                    <td>
                      <strong>{executive.name}</strong>
                    </td>
                    <td>{executive.position}</td>
                    <td>{executive.email}</td>
                    <td>{executive.phone}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(executive.status),
                          color: 'white'
                        }}
                      >
                        {getStatusIcon(executive.status)} {executive.status}
                      </span>
                    </td>
                    <td>{new Date(executive.dateOfAppointment).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        {executive.status === 'active' && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => updateStatus(executive.id, 'inactive')}
                          >
                            Deactivate
                          </button>
                        )}
                        {executive.status === 'inactive' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateStatus(executive.id, 'active')}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => updateStatus(executive.id, 'suspended')}
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
  );
}

 

