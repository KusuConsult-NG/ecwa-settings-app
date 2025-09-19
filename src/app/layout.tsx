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
              <a href="/" >🏠 <span>Home</span></a>
              <a href="/dashboard" >📊 <span>Dashboard</span></a>
              <a href="/expenditures" >🧾 <span>Expenditures</span></a>
              <a href="/expenditures/new" >➕ <span>Raise Expenditure</span></a>
              <a href="/income" >💰 <span>Income</span></a>
              <a href="/reports" >📈 <span>Reports</span></a>
              <a href="/audit" >🔍 <span>Audit Logs</span></a>
        <a href="/organization-management" >🏛️ <span>Organization Management</span></a>
        <a href="/verify-login" >🔐 <span>Leader Login</span></a>
        <a href="/hr" >🧑‍💼 <span>HR Dashboard</span></a>
        <a href="/hr/staff" >👥 <span>Staff Management</span></a>
        <a href="/hr/payroll" >🧾 <span>Payroll Management</span></a>
        <a href="/hr/leave" >🏖️ <span>Leave Management</span></a>
        <a href="/hr/queries" >📨 <span>Queries Management</span></a>
        <a href="/hr/lcc" >🏛️ <span>LCC Management</span></a>
        <a href="/hr/lc" >🏢 <span>LC Management</span></a>
        <a href="/hr/organization" >🏢 <span>Organization Settings</span></a>
        <a href="/hr/user-roles" >👤 <span>User Role Management</span></a>
        <a href="/hr/system-config" >⚙️ <span>System Configuration</span></a>
        <a href="/hr/security" >🔒 <span>Security Settings</span></a>
              <a href="/bank" >🏦 <span>Bank Management</span></a>
              <a href="/executive" >⭐ <span>Executive</span></a>
              <a href="/agencies">🏛️ <span>Agencies & Groups</span></a>
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


