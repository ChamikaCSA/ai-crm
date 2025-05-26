import { LeadStatus } from './api-types'

export const getStatusColor = (status: LeadStatus | string): string => {
  const statusKey = typeof status === 'string' ? status : (status as string).toLowerCase()
  const colors: Record<string, string> = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'qualified': 'bg-green-100 text-green-800',
    'proposal': 'bg-purple-100 text-purple-800',
    'negotiation': 'bg-orange-100 text-orange-800',
    'closed_won': 'bg-green-100 text-green-800',
    'closed_lost': 'bg-red-100 text-red-800'
  }
  return colors[statusKey] || 'bg-gray-100 text-gray-800'
}

export const formatStatus = (status: LeadStatus | string): string => {
  const statusStr = typeof status === 'string' ? status : (status as string).toLowerCase()
  return statusStr.split('_').map((word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export const getStatusWeight = (status: LeadStatus | string): number => {
  const statusKey = typeof status === 'string' ? status : (status as string).toLowerCase()
  const weights: Record<string, number> = {
    'new': 0,
    'contacted': 0.2,
    'qualified': 0.4,
    'proposal': 0.6,
    'negotiation': 0.8,
    'closed_won': 1,
    'closed_lost': 0
  }
  return weights[statusKey] || 0
}

export const getStatusIcon = (status: LeadStatus | string): string => {
  const statusKey = typeof status === 'string' ? status : (status as string).toLowerCase()
  const icons: Record<string, string> = {
    'new': '🆕',
    'contacted': '📞',
    'qualified': '✅',
    'proposal': '📝',
    'negotiation': '🤝',
    'closed_won': '🏆',
    'closed_lost': '❌'
  }
  return icons[statusKey] || '❓'
}
