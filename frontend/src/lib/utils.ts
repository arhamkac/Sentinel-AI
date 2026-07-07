import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, format = 'short'): string {
  const d = new Date(date)
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  if (format === 'full') {
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  }
  return d.toISOString()
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '…'
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return '#FF4D6D'
    case 'high':     return '#F97316'
    case 'medium':   return '#F59E0B'
    case 'low':      return '#22C55E'
    case 'info':     return '#00E5FF'
    default:         return '#64748B'
  }
}

export function getSeverityBg(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return 'rgba(255, 77, 109, 0.1)'
    case 'high':     return 'rgba(249, 115, 22, 0.1)'
    case 'medium':   return 'rgba(245, 158, 11, 0.1)'
    case 'low':      return 'rgba(34, 197, 94, 0.1)'
    case 'info':     return 'rgba(0, 229, 255, 0.1)'
    default:         return 'rgba(100, 116, 139, 0.1)'
  }
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
