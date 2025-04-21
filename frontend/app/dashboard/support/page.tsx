import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import SupportPageClient from './SupportPageClient'

export default async function SupportPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
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
            <SupportPageClient />
          </div>
        </div>
      </div>
    </div>
  )
}