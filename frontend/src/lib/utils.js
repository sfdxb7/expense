import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-AE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date) {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'

  return d.toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateInput(date) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}
