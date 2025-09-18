export interface ExpenditureRecord {
  id: string
  purpose: string
  category: 'Maintenance' | 'Welfare' | 'Admin' | 'Other'
  amount: number
  beneficiary: string
  bankName?: string
  accountNumber?: string
  viaAgency: boolean
  status: 'pending' | 'approved' | 'rejected'
  rejectionNote?: string
  submittedBy: string // user ID
  submittedByName: string
  submittedAt: string
  approvedBy?: string // user ID
  approvedByName?: string
  approvedAt?: string
  rejectedBy?: string // user ID
  rejectedByName?: string
  rejectedAt?: string
  orgId: string
  orgName: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenditureRequest {
  purpose: string
  category: 'Maintenance' | 'Welfare' | 'Admin' | 'Other'
  amount: number
  beneficiary: string
  bankName?: string
  accountNumber?: string
  viaAgency: boolean
}

export interface UpdateExpenditureStatusRequest {
  status: 'approved' | 'rejected'
  rejectionNote?: string
}

export const EXPENDITURE_CATEGORIES = [
  'Maintenance',
  'Welfare', 
  'Admin',
  'Other'
] as const

export const EXPENDITURE_STATUSES = [
  'pending',
  'approved', 
  'rejected'
] as const

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'var(--success)'
    case 'rejected':
      return 'var(--danger)'
    case 'pending':
    default:
      return 'var(--warning)'
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'approved':
      return '✅'
    case 'rejected':
      return '❌'
    case 'pending':
    default:
      return '⏳'
  }
}
