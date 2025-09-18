import type { Metadata } from "next"
import "./globals.css"
import Image from "next/image"
import ClientTopbar from "./topbar-client"

export const metadata: Metadata = {
  title: "ECWA Settings",
  description: "Organization settings management",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Remove server-side authentication to prevent redirect loops
  // Authentication will be handled by middleware and client-side

  return (
    <html lang="en">
      <body>
        <ClientTopbar />

        <div className="layout">
          <aside className="sidebar" id="sidebar">
            <div className="logo">
              <Image src="/logo.svg" alt="ECWA Settings" width={32} height={32} />
              <span>ECWA Settings</span>
            </div>
            <nav className="nav" id="nav">
              <a href="/" >🏠 Home</a>
              <a href="/dashboard" >📊 Dashboard</a>
              <a href="/expenditures" >🧾 Expenditures</a>
              <a href="/expenditures/new" >➕ Raise Expenditure</a>
              <a href="/approvals" >✅ Approvals</a>
              <a href="/income" >💰 Income</a>
              <a href="/reports" >📈 Reports</a>
              <a href="/audit" >🔍 Audit Logs</a>
              <a href="/hr" >🧑‍💼 HR Dashboard</a>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/agencies">🏛️ Agencies & Groups</a>
              <div style={{marginTop:'.5rem'}} className="badge">Organizations</div>
              <div id="org-links" style={{display:'none'}}>
                {/* Role-based org links will be populated by client-side JS */}
              </div>
              {/* Account menu */}
              <div style={{marginTop:'.5rem'}} className="badge">Account</div>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/account/new">New</a>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/account/history">View History</a>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/account/statements">Generate Statements</a>
              <a href="/hr/staff" >👥 Staff</a>
              <a href="/hr/payroll" >🧾 Payroll</a>
              <a href="/hr/leave" >🏖️ Leave</a>
              <a href="/hr/queries" >📨 Queries</a>
              <a href="/bank" >🏦 Bank</a>
              <a href="/executive" >⭐ Executive</a>
              <a href="/settings" >⚙️ Settings</a>
              <a href="/login" >🔐 Login</a>
              <a href="/signup" >📝 Sign Up</a>
            </nav>
          </aside>
          <main className="content">
            {children}
          </main>
        </div>
        
        <script dangerouslySetInnerHTML={{
          __html: `
            // Role-based sidebar organization links
            fetch('/api/me').then(r => r.json()).then(data => {
              const user = data.user;
              if (!user) return;
              
              const orgLinks = document.getElementById('org-links');
              if (!orgLinks) return;
              
              const canCreateDCC = ['admin', 'President', 'General Secretary', 'Treasurer'].includes(user.role);
              const canCreateLC = ['admin', 'President', 'General Secretary', 'Treasurer', 'Chairman', 'Secretary', 'LO'].includes(user.role);
              
              let links = '';
              if (canCreateDCC) links += '<a href="/org/dcc">Create DCCs (HQ)</a>';
              if (canCreateLC) links += '<a href="/org/create">Create LC (LCC)</a>';
              
              if (links) {
                orgLinks.innerHTML = links;
                orgLinks.style.display = 'block';
              }
            });
          `
        }} />
      </body>
    </html>
  )
}


