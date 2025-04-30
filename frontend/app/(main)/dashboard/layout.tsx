'use client'

import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/(main)/dashboard/dashboard-nav'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 border-r border-[var(--border)] bg-[var(--background)]">
          <div className="p-4">
            <DashboardNav />
          </div>
        </aside>
        <main className="flex-1 p-8 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}