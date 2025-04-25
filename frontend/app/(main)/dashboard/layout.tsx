'use client'

import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
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
        <aside className="w-64 border-r border-[var(--border)] bg-[var(--background)]">
          <div className="p-4">
            <DashboardNav />
          </div>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}