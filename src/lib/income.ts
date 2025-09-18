export interface IncomeRecord {
  id: string
  ref: string
  source: string
  giver: string
  narration: string
  amount: number
  bankRef: string
  submittedBy: string // user ID
  submittedByName: string
  submittedAt: string
  orgId: string
  orgName: string
  createdAt: string
  updatedAt: string
}

export interface CreateIncomeRequest {
  ref: string
  source: string
  giver: string
  narration: string
  amount: number
  bankRef: string
}

export const INCOME_SOURCES = [
  'Tithe',
  'Offering',
  'Donation',
  'Special Offering',
  'Building Fund',
  'Mission Fund',
  'Other'
] as const

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function generateIncomeRef(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INC-${year}${month}${day}${random}`
}
