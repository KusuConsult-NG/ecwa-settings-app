export interface LCCRecord {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  memberCount: number;
  maxCapacity: number;
  status: 'active' | 'inactive' | 'suspended';
  establishedDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

export interface CreateLCCRequest {
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  maxCapacity: number;
  establishedDate: string;
}

export interface UpdateLCCStatusRequest {
  status: 'active' | 'inactive' | 'suspended';
  reason?: string;
}

export const LCC_STATUSES = [
  'active',
  'inactive',
  'suspended'
] as const;

export function generateLCCId(): string {
  return `lcc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
