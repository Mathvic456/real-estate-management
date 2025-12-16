import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getDaysUntilExpiry(leaseEndDate?: string): number | null {
  if (!leaseEndDate) return null

  const today = new Date()
  const endDate = new Date(leaseEndDate)
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export function isLeaseExpiringSoon(leaseEndDate?: string, daysThreshold = 30): boolean {
  const daysUntil = getDaysUntilExpiry(leaseEndDate)
  if (daysUntil === null) return false

  return daysUntil > 0 && daysUntil <= daysThreshold
}
