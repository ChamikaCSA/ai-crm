'use client'

import { redirect } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CustomerDashboard } from '@/components/dashboard/customer/CustomerDashboard'
import { SalesRepDashboard } from '@/components/dashboard/sales-rep/SalesRepDashboard'
import { SalesManagerDashboard } from '@/components/dashboard/sales-manager/SalesManagerDashboard'
import { MarketingSpecialistDashboard } from '@/components/dashboard/marketing-specialist/MarketingSpecialistDashboard'
import { DataAnalystDashboard } from '@/components/dashboard/data-analyst/DataAnalystDashboard'
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard'

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
    <div className="container mx-auto px-4 py-8">
      {renderDashboard()}
    </div>
  )
}