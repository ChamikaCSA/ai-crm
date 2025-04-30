'use client'

import { redirect } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CustomerDashboard } from '@/components/(main)/dashboard/customer/customer-dashboard'
import { SalesRepDashboard } from '@/components/(main)/dashboard/sales-rep/sales-rep-dashboard'
import { SalesManagerDashboard } from '@/components/(main)/dashboard/sales-manager/sales-manager-dashboard'
import { MarketingSpecialistDashboard } from '@/components/(main)/dashboard/marketing-specialist/marketing-specialist-dashboard'
import { DataAnalystDashboard } from '@/components/(main)/dashboard/data-analyst/data-analyst-dashboard'
import { AdminDashboard } from '@/components/(main)/dashboard/admin/admin-dashboard'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!user) {
    redirect('/auth/login')
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'customer':
        return <CustomerDashboard />
      case 'sales_rep':
        return <SalesRepDashboard />
      case 'sales_manager':
        return <SalesManagerDashboard />
      case 'marketing_specialist':
        return <MarketingSpecialistDashboard />
      case 'data_analyst':
        return <DataAnalystDashboard />
      case 'admin':
        return <AdminDashboard />
      default:
        return <CustomerDashboard />
    }
  }

  return (
    <div>
      {renderDashboard()}
    </div>
  )
}