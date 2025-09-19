export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountType: 'savings' | 'current' | 'fixed_deposit' | 'investment';
  currency: string;
  openingDate: string;
  branch: string;
  swiftCode?: string;
  iban?: string;
  currentBalance: number;
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  authorizedSignatories: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  orgId: string;
  orgName: string;
}

export interface CreateBankAccountRequest {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountType: 'savings' | 'current' | 'fixed_deposit' | 'investment';
  currency: string;
  openingDate: string;
  branch: string;
  swiftCode?: string;
  iban?: string;
  currentBalance: number;
  authorizedSignatories: string[];
  notes?: string;
}

export interface UpdateBankAccountStatusRequest {
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  reason?: string;
}

export const BANK_ACCOUNT_TYPES = [
  'savings',
  'current', 
  'fixed_deposit',
  'investment'
] as const;

export const BANK_ACCOUNT_STATUSES = [
  'active',
  'inactive',
  'suspended',
  'closed'
] as const;

export function generateAccountId(): string {
  return `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'var(--success)';
    case 'inactive': return 'var(--warning)';
    case 'suspended': return 'var(--danger)';
    case 'closed': return 'var(--muted)';
    default: return 'var(--muted)';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'active': return '✅';
    case 'inactive': return '⏸️';
    case 'suspended': return '🚫';
    case 'closed': return '🔒';
    default: return '❓';
  }
}