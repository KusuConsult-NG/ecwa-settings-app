// COMMENTED OUT - CAUSING DATABASE MISMATCH ERRORS
// import { neon } from '@neondatabase/serverless';

// Database connection - only connect if DATABASE_URL is available
// const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const sql = null; // Disabled to fix mismatch errors

// Database schema creation
export const createTables = async () => {
  try {
    if (!sql) {
      throw new Error('DATABASE_URL not configured');
    }
    
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'User',
        org_id UUID,
        org_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `;

    // Organizations table
    await sql`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        type VARCHAR(50) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        established_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        website VARCHAR(255),
        executive_roles JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id)
      )
    `;

    // Leaders table
    await sql`
      CREATE TABLE IF NOT EXISTS leaders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        position VARCHAR(255) NOT NULL,
        organization_id UUID REFERENCES organizations(id),
        organization_level VARCHAR(50) NOT NULL,
        verification_code VARCHAR(10),
        verification_expiry TIMESTAMP,
        verification_status VARCHAR(50) DEFAULT 'pending',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `;

    // Agencies table
    await sql`
      CREATE TABLE IF NOT EXISTS agencies (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        leader_name VARCHAR(255) NOT NULL,
        leader_email VARCHAR(255) NOT NULL,
        leader_phone VARCHAR(50),
        member_count INTEGER DEFAULT 0,
        meeting_day VARCHAR(50),
        meeting_time VARCHAR(50),
        venue VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        parent_organization VARCHAR(255),
        parent_organization_name VARCHAR(255),
        objectives JSONB DEFAULT '[]',
        activities JSONB DEFAULT '[]',
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // Staff table
    await sql`
      CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        position VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        employment_type VARCHAR(50) DEFAULT 'full-time',
        salary DECIMAL(10,2),
        hire_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // LC (Local Church) table
    await sql`
      CREATE TABLE IF NOT EXISTS lc (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        established_date DATE NOT NULL,
        member_count INTEGER DEFAULT 0,
        max_capacity INTEGER DEFAULT 100,
        leader_id VARCHAR(255) REFERENCES leaders(id),
        leader_name VARCHAR(255),
        contact_email VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50) NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // LCC (Local Church Council) table
    await sql`
      CREATE TABLE IF NOT EXISTS lcc (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        established_date DATE NOT NULL,
        member_count INTEGER DEFAULT 0,
        max_capacity INTEGER DEFAULT 50,
        leader_id VARCHAR(255) REFERENCES leaders(id),
        leader_name VARCHAR(255),
        contact_email VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50) NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // Leave table
    await sql`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id VARCHAR(255) PRIMARY KEY,
        staff_id VARCHAR(255) REFERENCES staff(id),
        staff_name VARCHAR(255) NOT NULL,
        leave_type VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_requested INTEGER NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        approved_by VARCHAR(255),
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // Payroll table
    await sql`
      CREATE TABLE IF NOT EXISTS payroll (
        id VARCHAR(255) PRIMARY KEY,
        staff_id VARCHAR(255) REFERENCES staff(id),
        staff_name VARCHAR(255) NOT NULL,
        pay_period_start DATE NOT NULL,
        pay_period_end DATE NOT NULL,
        basic_salary DECIMAL(10,2) NOT NULL,
        allowances DECIMAL(10,2) DEFAULT 0,
        deductions DECIMAL(10,2) DEFAULT 0,
        net_salary DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // Queries table
    await sql`
      CREATE TABLE IF NOT EXISTS queries (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        assigned_to VARCHAR(255),
        assigned_by VARCHAR(255),
        resolution TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // Expenditures table
    await sql`
      CREATE TABLE IF NOT EXISTS expenditures (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        receipt_number VARCHAR(255),
        vendor VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        approved_by VARCHAR(255),
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // Income table
    await sql`
      CREATE TABLE IF NOT EXISTS income (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        source VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        reference_number VARCHAR(255),
        payer VARCHAR(255),
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // Bank table
    await sql`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id VARCHAR(255) PRIMARY KEY,
        account_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(50) NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        account_type VARCHAR(50) NOT NULL,
        balance DECIMAL(10,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'NGN',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    // Executives table
    await sql`
      CREATE TABLE IF NOT EXISTS executives (
        id VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        position VARCHAR(255) NOT NULL,
        organization_id UUID REFERENCES organizations(id),
        organization_level VARCHAR(50) NOT NULL,
        term_start DATE,
        term_end DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_by UUID REFERENCES users(id),
        org_id UUID REFERENCES organizations(id),
        org_name VARCHAR(255)
      )
    `;

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

export { sql };
