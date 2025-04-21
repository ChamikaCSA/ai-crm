'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import {
  Home,
  MessageSquare,
  Lightbulb,
  User,
  LifeBuoy,
  Settings,
  Users,
  ClipboardList,
  BarChart3,
  Target,
  Database,
  Shield,
} from 'lucide-react'

const customerNavigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Chat Support', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Recommendations', href: '/dashboard/recommendations', icon: Lightbulb },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const salesRepNavigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardList },
  { name: 'Performance', href: '/dashboard/performance', icon: BarChart3 },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const salesManagerNavigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Performance', href: '/dashboard/performance', icon: BarChart3 },
  { name: 'Targets', href: '/dashboard/targets', icon: Target },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const marketingNavigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Target },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Audience', href: '/dashboard/audience', icon: Users },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const dataAnalystNavigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Data Analysis', href: '/dashboard/analysis', icon: Database },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Predictions', href: '/dashboard/predictions', icon: Target },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'System', href: '/dashboard/system', icon: Shield },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const getNavigation = () => {
    switch (user?.role) {
      case 'customer':
        return customerNavigation
      case 'sales_rep':
        return salesRepNavigation
      case 'sales_manager':
        return salesManagerNavigation
      case 'marketing_specialist':
        return marketingNavigation
      case 'data_analyst':
        return dataAnalystNavigation
      case 'admin':
        return adminNavigation
      default:
        return customerNavigation
    }
  }

  const navigation = getNavigation()

  return (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors',
              isActive && 'bg-[var(--accent)] text-[var(--accent-foreground)]'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5',
                isActive ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--primary)]'
              )}
            />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}