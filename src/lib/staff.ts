export interface StaffRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  qualifications: string;
  previousExperience: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  qualifications: string;
  previousExperience: string;
}

export interface UpdateStaffStatusRequest {
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  reason?: string;
}

export const STAFF_POSITIONS = [
  'Pastor',
  'Elder',
  'Deacon',
  'Deaconess',
  'Secretary',
  'Treasurer',
  'Choir Director',
  'Sunday School Teacher',
  'Youth Leader',
  'Women Leader',
  'Men Leader',
  'Children Leader',
  'Usher',
  'Security',
  'Cleaner',
  'Driver',
  'Other'
] as const;

export const STAFF_DEPARTMENTS = [
  'Ministry',
  'Administration',
  'Finance',
  'Music',
  'Children',
  'Youth',
  'Women',
  'Men',
  'Evangelism',
  'Welfare',
  'Maintenance',
  'Security',
  'Other'
] as const;

export const STAFF_STATUSES = [
  'active',
  'inactive',
  'suspended',
  'terminated'
] as const;

export function generateStaffId(): string {
  return `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'var(--success)';
    case 'inactive': return 'var(--warning)';
    case 'suspended': return 'var(--danger)';
    case 'terminated': return 'var(--muted)';
    default: return 'var(--muted)';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'active': return '✅';
    case 'inactive': return '⏸️';
    case 'suspended': return '🚫';
    case 'terminated': return '❌';
    default: return '❓';
  }
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency
  }).format(amount);
}
