export interface AgencyRecord {
  id: string;
  name: string;
  type: 'ministry' | 'department' | 'committee' | 'fellowship' | 'other';
  description: string;
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

export interface CreateAgencyRequest {
  name: string;
  type: 'ministry' | 'department' | 'committee' | 'fellowship' | 'other';
  description: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
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
  'other'
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
    case 'other': return 'var(--muted)';
    default: return 'var(--muted)';
  }
}
