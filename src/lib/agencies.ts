export interface AgencyRecord {
  id: string;
  name: string;
  type: 'ministry' | 'department' | 'committee' | 'fellowship' | 'group';
  description: string;
  leader: {
    name: string;
    email: string;
    phone: string;
  };
  memberCount: number;
  establishedDate: string;
  meetingDay: string;
  meetingTime: string;
  venue: string;
  status: 'active' | 'inactive' | 'suspended';
  parentOrganization?: string;
  parentOrganizationName?: string;
  objectives: string[];
  activities: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

export interface CreateAgencyRequest {
  name: string;
  type: 'ministry' | 'department' | 'committee' | 'fellowship' | 'group';
  description: string;
  leader: {
    name: string;
    email: string;
    phone: string;
  };
  memberCount: number;
  establishedDate: string;
  meetingDay: string;
  meetingTime: string;
  venue: string;
  parentOrganization?: string;
  objectives: string[];
  activities: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface UpdateAgencyStatusRequest {
  status: 'active' | 'inactive' | 'suspended';
  reason?: string;
}

export const AGENCY_TYPES = [
  'ministry',
  'department',
  'committee',
  'fellowship',
  'group'
] as const;

export const AGENCY_STATUSES = [
  'active',
  'inactive',
  'suspended'
] as const;

export function generateAgencyId(): string {
  return `agency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'var(--success)';
    case 'inactive': return 'var(--warning)';
    case 'suspended': return 'var(--danger)';
    default: return 'var(--muted)';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'active': return '✅';
    case 'inactive': return '⏸️';
    case 'suspended': return '🚫';
    default: return '❓';
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'ministry': return 'var(--primary)';
    case 'department': return 'var(--secondary)';
    case 'committee': return 'var(--success)';
    case 'fellowship': return 'var(--warning)';
    case 'group': return 'var(--info)';
    default: return 'var(--muted)';
  }
}