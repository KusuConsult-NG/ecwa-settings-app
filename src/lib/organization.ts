// Organization Hierarchy Types and Constants

export type OrganizationLevel = 'GCC' | 'DCC' | 'LCC' | 'LC' | 'PrayerHouse';

export type LeaderPosition = 
  // GCC Positions
  | 'President' | 'Vice President' | 'Assistant Secretary' | 'Treasurer' | 'Financial Secretary'
  // DCC Positions  
  | 'DCC Secretary' | 'Chairman' | 'Vice Chairman' | 'Asst D. Sec' | 'Treasurer' | 'Financial' | 'Delegate'
  // LCC Positions
  | 'LCC Secretary' | 'Local Overseer' | 'Asst Local Overseer' | 'Asst. Sec' | 'Treasurer' | 'Fin Sec' | 'Delegate'
  // LC Positions
  | 'LC Secretary' | 'Senior Minister' | 'Pastor' | 'Asst Sec' | 'Treasurer' | 'Financial Sec' | 'Chief Usher' | 'Works Supervisor';

export type VerificationStatus = 'pending' | 'verified' | 'expired';

export interface Leader {
  id: string;
  title: string;
  firstName: string;
  surname: string;
  otherNames?: string;
  email: string;
  phone: string;
  position: LeaderPosition;
  organizationId: string;
  organizationLevel: OrganizationLevel;
  verificationCode?: string;
  verificationStatus: VerificationStatus;
  verificationExpiry?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Organization {
  id: string;
  name: string;
  level: OrganizationLevel;
  parentId?: string;
  parentName?: string;
  secretaryId?: string;
  secretaryName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
}

export interface AgencyGroup {
  id: string;
  name: string;
  type: 'Agency' | 'Group';
  organizationId: string;
  organizationLevel: OrganizationLevel;
  leaderId?: string;
  leaderName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
}

// Position mappings by organization level
export const POSITIONS_BY_LEVEL: Record<OrganizationLevel, LeaderPosition[]> = {
  GCC: ['President', 'Vice President', 'Assistant Secretary', 'Treasurer', 'Financial Secretary'],
  DCC: ['DCC Secretary', 'Chairman', 'Vice Chairman', 'Asst D. Sec', 'Treasurer', 'Financial', 'Delegate'],
  LCC: ['LCC Secretary', 'Local Overseer', 'Asst Local Overseer', 'Asst. Sec', 'Treasurer', 'Fin Sec', 'Delegate'],
  LC: ['LC Secretary', 'Senior Minister', 'Pastor', 'Asst Sec', 'Treasurer', 'Financial Sec', 'Chief Usher', 'Works Supervisor'],
  PrayerHouse: ['LC Secretary', 'Senior Minister', 'Pastor', 'Asst Sec', 'Treasurer', 'Financial Sec', 'Chief Usher', 'Works Supervisor']
};

// Organization hierarchy structure
export const ORGANIZATION_HIERARCHY = {
  GCC: {
    name: 'ECWA Global Headquarters',
    children: ['DCC']
  },
  DCC: {
    name: 'District Coordinating Council',
    children: ['LCC']
  },
  LCC: {
    name: 'Local Coordinating Council', 
    children: ['LC']
  },
  LC: {
    name: 'Local Church',
    children: ['PrayerHouse']
  },
  PrayerHouse: {
    name: 'Prayer House',
    children: []
  }
};

// Predefined organization names by level
export const ORGANIZATION_NAMES: Record<OrganizationLevel, string[]> = {
  GCC: ['ECWA Global Headquarters'],
  DCC: [
    'ECWA Jos DCC', 'ECWA Kaduna DCC', 'ECWA Abuja DCC', 'ECWA Kano DCC',
    'ECWA Lagos DCC', 'ECWA Port Harcourt DCC', 'ECWA Ibadan DCC',
    'ECWA Bauchi DCC', 'ECWA Maiduguri DCC', 'ECWA Sokoto DCC',
    'ECWA Minna DCC', 'ECWA Makurdi DCC', 'ECWA Yola DCC',
    'ECWA Gombe DCC', 'ECWA Damaturu DCC', 'Kaswamagamu DCC'
  ],
  LCC: [
    'ECWA Jos Central LCC', 'ECWA Jos North LCC', 'ECWA Jos South LCC',
    'ECWA Kaduna Central LCC', 'ECWA Abuja Central LCC', 'ECWA Kano Central LCC',
    'ECWA Lagos Island LCC', 'ECWA Port Harcourt Central LCC', 'ECWA Ibadan Central LCC'
  ],
  LC: [
    'ECWA Jos Central LC', 'ECWA Kaduna Central LC', 'ECWA Abuja Central LC',
    'ECWA Kano Central LC', 'ECWA Lagos Island LC', 'ECWA Port Harcourt Central LC'
  ],
  PrayerHouse: [
    'Prayer House 1', 'Prayer House 2', 'Prayer House 3'
  ]
};

// Helper functions
export function getOrganizationLevelDisplay(level: OrganizationLevel): string {
  return ORGANIZATION_HIERARCHY[level].name;
}

export function getAvailablePositions(level: OrganizationLevel): LeaderPosition[] {
  return POSITIONS_BY_LEVEL[level] || [];
}

export function canCreateChildOrganization(currentLevel: OrganizationLevel): OrganizationLevel[] {
  return ORGANIZATION_HIERARCHY[currentLevel].children as OrganizationLevel[];
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isVerificationCodeExpired(expiryDate: string): boolean {
  return new Date() > new Date(expiryDate);
}

export function getVerificationExpiry(): string {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 30); // 30 minutes expiry
  return expiry.toISOString();
}

export function formatLeaderName(leader: Leader): string {
  const parts = [leader.title, leader.firstName, leader.surname];
  if (leader.otherNames) {
    parts.splice(2, 0, leader.otherNames);
  }
  return parts.join(' ');
}

export function getOrganizationPath(org: Organization, allOrgs: Organization[]): string {
  const path = [org.name];
  let current = org;
  
  while (current.parentId) {
    const parent = allOrgs.find(o => o.id === current.parentId);
    if (parent) {
      path.unshift(parent.name);
      current = parent;
    } else {
      break;
    }
  }
  
  return path.join(' → ');
}
