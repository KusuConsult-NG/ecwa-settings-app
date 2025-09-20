export const dynamic = 'force-dynamic';

export default function HrPage(){
  return (
    <section className="container">
      <div className="section-title">
        <h2>HR Dashboard</h2>
      </div>
      
      <div className="grid cols-3" style={{marginBottom: '2rem'}}>
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>👥</div>
          <h3 style={{margin: '0 0 0.5rem 0'}}>Staff Management</h3>
          <p style={{color: 'var(--muted)', margin: '0 0 1rem 0'}}>Manage staff records, positions, and departments</p>
          <a href="/hr/staff" className="btn primary">Manage Staff</a>
        </div>
        
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🧾</div>
          <h3 style={{margin: '0 0 0.5rem 0'}}>Payroll Management</h3>
          <p style={{color: 'var(--muted)', margin: '0 0 1rem 0'}}>Process salaries, allowances, and deductions</p>
          <a href="/hr/payroll" className="btn primary">Manage Payroll</a>
        </div>
        
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🏖️</div>
          <h3 style={{margin: '0 0 0.5rem 0'}}>Leave Management</h3>
          <p style={{color: 'var(--muted)', margin: '0 0 1rem 0'}}>Handle leave applications and approvals</p>
          <a href="/hr/leave" className="btn primary">Manage Leave</a>
        </div>
      </div>

      <div className="grid cols-3" style={{marginBottom: '2rem'}}>
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📨</div>
          <h3 style={{margin: '0 0 0.5rem 0'}}>Queries Management</h3>
          <p style={{color: 'var(--muted)', margin: '0 0 1rem 0'}}>Handle staff queries and responses</p>
          <a href="/hr/queries" className="btn primary">Manage Queries</a>
        </div>
        
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🏛️</div>
          <h3 style={{margin: '0 0 0.5rem 0'}}>LCC Management</h3>
          <p style={{color: 'var(--muted)', margin: '0 0 1rem 0'}}>Manage Local Church Councils</p>
          <a href="/hr/lcc" className="btn primary">Manage LCCs</a>
        </div>
        
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🏢</div>
          <h3 style={{margin: '0 0 0.5rem 0'}}>LC Management</h3>
          <p style={{color: 'var(--muted)', margin: '0 0 1rem 0'}}>Manage Local Churches</p>
          <a href="/hr/lc" className="btn primary">Manage LCs</a>
        </div>
      </div>

      <div className="grid cols-3">
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🏢</div>
          <h3 style={{margin: '0 0 0.5rem 0'}}>Organization Settings</h3>
          <p style={{color: 'var(--muted)', margin: '0 0 1rem 0'}}>Manage organization hierarchy and settings</p>
          <a href="/hr/organization" className="btn primary">Organization</a>
        </div>
        
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>👤</div>
          <h3 style={{margin: '0 0 0.5rem 0'}}>User Roles</h3>
          <p style={{color: 'var(--muted)', margin: '0 0 1rem 0'}}>Manage user accounts and permissions</p>
          <a href="/hr/user-roles" className="btn primary">User Roles</a>
        </div>
        
        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⚙️</div>
          <h3 style={{margin: '0 0 0.5rem 0'}}>System Config</h3>
          <p style={{color: 'var(--muted)', margin: '0 0 1rem 0'}}>Configure system settings and preferences</p>
          <a href="/hr/system-config" className="btn primary">System Config</a>
        </div>
      </div>
    </section>
  )
}

 

