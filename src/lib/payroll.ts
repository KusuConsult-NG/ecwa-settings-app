export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  staffPosition: string;
  staffDepartment: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  payPeriod: string;
  payDate: string;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  approvedByName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

export interface CreatePayrollRequest {
  staffId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  payPeriod: string;
  payDate: string;
}

export interface UpdatePayrollStatusRequest {
  status: 'pending' | 'approved' | 'paid';
}

export const PAYROLL_STATUSES = [
  'pending',
  'approved',
  'paid'
] as const;

export function generatePayrollId(): string {
  return `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateNetSalary(basicSalary: number, allowances: number, deductions: number): number {
  const grossSalary = basicSalary + allowances;
  return grossSalary - deductions;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'var(--warning)';
    case 'approved': return 'var(--info)';
    case 'paid': return 'var(--success)';
    default: return 'var(--muted)';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'pending': return '⏳';
    case 'approved': return '✅';
    case 'paid': return '💰';
    default: return '❓';
  }
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency
  }).format(amount);
}
