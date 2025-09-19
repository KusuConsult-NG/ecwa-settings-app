export interface QueryRecord {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'technical' | 'financial' | 'hr' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  resolution?: string;
  resolutionDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

export interface CreateQueryRequest {
  title: string;
  description: string;
  category: 'general' | 'technical' | 'financial' | 'hr' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateQueryStatusRequest {
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
}

export const QUERY_CATEGORIES = [
  'general',
  'technical',
  'financial',
  'hr',
  'other'
] as const;

export const QUERY_PRIORITIES = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

export const QUERY_STATUSES = [
  'open',
  'assigned',
  'in_progress',
  'resolved',
  'closed'
] as const;

export function generateQueryId(): string {
  return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'open': return 'var(--warning)';
    case 'assigned': return 'var(--info)';
    case 'in_progress': return 'var(--primary)';
    case 'resolved': return 'var(--success)';
    case 'closed': return 'var(--muted)';
    default: return 'var(--muted)';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'open': return '📝';
    case 'assigned': return '👤';
    case 'in_progress': return '🔄';
    case 'resolved': return '✅';
    case 'closed': return '🔒';
    default: return '❓';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'low': return 'var(--success)';
    case 'medium': return 'var(--warning)';
    case 'high': return 'var(--danger)';
    case 'urgent': return 'var(--danger)';
    default: return 'var(--muted)';
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'general': return 'var(--muted)';
    case 'technical': return 'var(--primary)';
    case 'financial': return 'var(--success)';
    case 'hr': return 'var(--secondary)';
    case 'other': return 'var(--warning)';
    default: return 'var(--muted)';
  }
}
