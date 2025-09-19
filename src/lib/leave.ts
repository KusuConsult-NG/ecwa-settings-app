export interface LeaveRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'study' | 'other';
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

export interface CreateLeaveRequest {
  staffId: string;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'study' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface LeaveBalance {
  staffId: string;
  annualLeave: number;
  sickLeave: number;
  maternityLeave: number;
  paternityLeave: number;
  emergencyLeave: number;
  studyLeave: number;
  totalUsed: number;
  totalRemaining: number;
}

export const LEAVE_TYPES = [
  'annual',
  'sick',
  'maternity',
  'paternity',
  'emergency',
  'study',
  'other'
] as const;

export const LEAVE_STATUSES = [
  'pending',
  'approved',
  'rejected'
] as const;

export function generateLeaveId(): string {
  return `leave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'var(--warning)';
    case 'approved': return 'var(--success)';
    case 'rejected': return 'var(--danger)';
    default: return 'var(--muted)';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'pending': return '⏳';
    case 'approved': return '✅';
    case 'rejected': return '❌';
    default: return '❓';
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'annual': return 'var(--primary)';
    case 'sick': return 'var(--danger)';
    case 'maternity': return 'var(--success)';
    case 'paternity': return 'var(--info)';
    case 'emergency': return 'var(--warning)';
    case 'study': return 'var(--secondary)';
    case 'other': return 'var(--muted)';
    default: return 'var(--muted)';
  }
}

export function calculateLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}
