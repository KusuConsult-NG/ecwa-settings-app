export interface ExecutiveRecord {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  dateOfAppointment: string;
  termLength: number; // in months
  status: 'active' | 'inactive' | 'suspended';
  qualifications: string;
  previousExperience: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export const EXECUTIVE_POSITIONS = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Financial Secretary',
  'Assistant Secretary',
  'Assistant Treasurer',
  'Public Relations Officer',
  'Welfare Officer',
  'Youth Coordinator',
  'Women Coordinator',
  'Children Coordinator',
  'Evangelism Coordinator',
  'Music Director',
  'Choir Director',
  'Usher Coordinator',
  'Security Coordinator',
  'Maintenance Coordinator',
  'Transportation Coordinator',
  'Other'
] as const;

export const EXECUTIVE_STATUSES = [
  'active',
  'inactive', 
  'suspended'
] as const;

export function generateExecutiveId(): string {
  return `EXE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatExecutiveName(executive: ExecutiveRecord): string {
  return `${executive.name} (${executive.position})`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'green';
    case 'inactive': return 'gray';
    case 'suspended': return 'red';
    default: return 'gray';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'active': return '✅';
    case 'inactive': return '⏸️';
    case 'suspended': return '⛔';
    default: return '❓';
  }
}
