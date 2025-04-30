'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  Home,
  MessageSquare,
  Lightbulb,
  User,
  Headphones,
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
  { name: 'Support', href: '/dashboard/support', icon: Headphones },
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
    <nav className="space-y-1 p-2">
      {navigation.map((item, index) => {
        const isActive = pathname === item.href
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              href={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
                'relative overflow-hidden',
                isActive && 'bg-[var(--accent)] text-[var(--accent-foreground)]'
              )}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
              />
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)]"
                initial={false}
                animate={{ scaleY: isActive ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ zIndex: 20 }}
              />
              <div className="relative z-10 flex items-center">
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 transition-transform duration-200',
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--text-tertiary)] group-hover:text-[var(--primary)]',
                    'group-hover:scale-110'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-[var(--accent)]"
                  layoutId="activeNavItem"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          </motion.div>
        )
      })}
    </nav>
  )
}