import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { CustomerDashboard } from '@/components/dashboard/customer/CustomerDashboard'
import { SalesRepDashboard } from '@/components/dashboard/sales-rep/SalesRepDashboard'
import { SalesManagerDashboard } from '@/components/dashboard/sales-manager/SalesManagerDashboard'
import { MarketingSpecialistDashboard } from '@/components/dashboard/marketing-specialist/MarketingSpecialistDashboard'
import { DataAnalystDashboard } from '@/components/dashboard/data-analyst/DataAnalystDashboard'
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const renderDashboard = () => {
    switch (session.user.role) {
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
    <div className="flex min-h-screen flex-col">
      <Header session={session} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <DashboardNav />
          </div>
          <div className="md:col-span-9">
            {renderDashboard()}
          </div>
        </div>
      </div>
    </div>
  )
}