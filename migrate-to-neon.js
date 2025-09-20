#!/usr/bin/env node

// Migration script to move data from file storage to Neon database
import { neon } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
const STORAGE_FILE = path.join(process.cwd(), '.data', 'users.json');

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrateData() {
  try {
    console.log('🚀 Starting migration from file storage to Neon database...');

    // Read existing data from file
    let fileData;
    try {
      const data = await fs.readFile(STORAGE_FILE, 'utf-8');
      fileData = JSON.parse(data);
    } catch (error) {
      console.error('❌ Error reading file data:', error);
      return;
    }

    console.log(`📊 Found ${Object.keys(fileData).length} records in file storage`);

    // Initialize database tables
    console.log('🔧 Creating database tables...');
    await createTables();

    // Migrate users
    console.log('👥 Migrating users...');
    let userCount = 0;
    for (const [key, value] of Object.entries(fileData)) {
      if (key.startsWith('user:')) {
        try {
          const user = JSON.parse(value);
          await sql`
            INSERT INTO users (
              id, email, name, phone, address, password_hash, 
              role, org_id, org_name, is_active, created_at, updated_at, last_login
            )
            VALUES (
              ${user.id}, ${user.email}, ${user.name}, 
              ${user.phone || null}, ${user.address || null}, ${user.passwordHash},
              ${user.role || 'User'}, ${user.orgId || null}, ${user.orgName || null}, 
              ${user.isActive ?? true}, ${user.createdAt}, ${user.updatedAt}, 
              ${user.lastLogin ? new Date(user.lastLogin) : null}
            )
            ON CONFLICT (email) DO NOTHING
          `;
          userCount++;
        } catch (error) {
          console.error(`❌ Error migrating user ${key}:`, error);
        }
      }
    }
    console.log(`✅ Migrated ${userCount} users`);

    // Migrate organizations
    console.log('🏢 Migrating organizations...');
    let orgCount = 0;
    for (const [key, value] of Object.entries(fileData)) {
      if (key.startsWith('org:') && !key.endsWith(':index')) {
        try {
          const org = JSON.parse(value);
          await sql`
            INSERT INTO organizations (
              id, name, code, type, address, city, state, country,
              established_date, status, contact_email, contact_phone, website,
              executive_roles, created_at, updated_at, created_by
            )
            VALUES (
              ${org.id}, ${org.name}, ${org.code || null}, ${org.type || 'DCC'}, 
              ${org.address || null}, ${org.city || null}, ${org.state || null}, 
              ${org.country || null}, ${org.establishedDate ? new Date(org.establishedDate) : null},
              ${org.status || 'active'}, ${org.contactEmail || null}, ${org.contactPhone || null},
              ${org.website || null}, ${JSON.stringify(org.executiveRoles || [])},
              ${org.createdAt}, ${org.updatedAt || org.createdAt}, ${org.createdBy || null}
            )
            ON CONFLICT (id) DO NOTHING
          `;
          orgCount++;
        } catch (error) {
          console.error(`❌ Error migrating organization ${key}:`, error);
        }
      }
    }
    console.log(`✅ Migrated ${orgCount} organizations`);

    // Migrate leaders
    console.log('👑 Migrating leaders...');
    let leaderCount = 0;
    for (const [key, value] of Object.entries(fileData)) {
      if (key.startsWith('leader:')) {
        try {
          const leader = JSON.parse(value);
          await sql`
            INSERT INTO leaders (
              id, first_name, surname, email, position, organization_id,
              organization_level, verification_code, verification_expiry,
              verification_status, is_active, created_at, updated_at, last_login
            )
            VALUES (
              ${leader.id}, ${leader.firstName}, ${leader.surname}, ${leader.email},
              ${leader.position}, ${leader.organizationId || null}, ${leader.organizationLevel},
              ${leader.verificationCode || null}, ${leader.verificationExpiry ? new Date(leader.verificationExpiry) : null},
              ${leader.verificationStatus || 'pending'}, ${leader.isActive ?? true},
              ${leader.createdAt}, ${leader.updatedAt || leader.createdAt},
              ${leader.lastLogin ? new Date(leader.lastLogin) : null}
            )
            ON CONFLICT (email) DO NOTHING
          `;
          leaderCount++;
        } catch (error) {
          console.error(`❌ Error migrating leader ${key}:`, error);
        }
      }
    }
    console.log(`✅ Migrated ${leaderCount} leaders`);

    // Migrate agencies
    console.log('🏛️ Migrating agencies...');
    let agencyCount = 0;
    for (const [key, value] of Object.entries(fileData)) {
      if (key.startsWith('agency:')) {
        try {
          const agency = JSON.parse(value);
          await sql`
            INSERT INTO agencies (
              id, name, type, description, leader_name, leader_email, leader_phone,
              member_count, meeting_day, meeting_time, venue, status,
              parent_organization, parent_organization_name, objectives, activities,
              contact_email, contact_phone, contact_address, created_at, updated_at,
              created_by, org_id, org_name
            )
            VALUES (
              ${agency.id}, ${agency.name}, ${agency.type}, ${agency.description || null},
              ${agency.leader.name}, ${agency.leader.email}, ${agency.leader.phone || null},
              ${agency.memberCount || 0}, ${agency.meetingDay || null}, ${agency.meetingTime || null},
              ${agency.venue || null}, ${agency.status || 'active'}, ${agency.parentOrganization || null},
              ${agency.parentOrganizationName || null}, ${JSON.stringify(agency.objectives || [])},
              ${JSON.stringify(agency.activities || [])}, ${agency.contactInfo?.email || agency.leader.email},
              ${agency.contactInfo?.phone || null}, ${agency.contactInfo?.address || null},
              ${agency.createdAt}, ${agency.updatedAt || agency.createdAt},
              ${agency.createdBy || null}, ${agency.orgId || null}, ${agency.orgName || null}
            )
            ON CONFLICT (id) DO NOTHING
          `;
          agencyCount++;
        } catch (error) {
          console.error(`❌ Error migrating agency ${key}:`, error);
        }
      }
    }
    console.log(`✅ Migrated ${agencyCount} agencies`);

    // Migrate KV store data
    console.log('🗄️ Migrating KV store data...');
    let kvCount = 0;
    for (const [key, value] of Object.entries(fileData)) {
      if (key.includes(':index') || key.startsWith('user:') || key.startsWith('org:') || 
          key.startsWith('leader:') || key.startsWith('agency:')) {
        try {
          await sql`
            INSERT INTO kv_store (key, value, created_at, updated_at)
            VALUES (${key}, ${value}, NOW(), NOW())
            ON CONFLICT (key) DO NOTHING
          `;
          kvCount++;
        } catch (error) {
          console.error(`❌ Error migrating KV data ${key}:`, error);
        }
      }
    }
    console.log(`✅ Migrated ${kvCount} KV records`);

    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Organizations: ${orgCount}`);
    console.log(`   - Leaders: ${leaderCount}`);
    console.log(`   - Agencies: ${agencyCount}`);
    console.log(`   - KV Records: ${kvCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function createTables() {
  // Create all the tables as defined in database.ts
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
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
    )`,
    
    // Organizations table
    `CREATE TABLE IF NOT EXISTS organizations (
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
    )`,
    
    // Leaders table
    `CREATE TABLE IF NOT EXISTS leaders (
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
    )`,
    
    // Agencies table
    `CREATE TABLE IF NOT EXISTS agencies (
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
    )`,
    
    // KV Store table
    `CREATE TABLE IF NOT EXISTS kv_store (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`
  ];

  for (const tableSQL of tables) {
    await sql.unsafe(tableSQL);
  }
}

// Run migration
migrateData();
