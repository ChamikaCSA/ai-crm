'use client'

import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'
import SupportPageClient from './SupportPageClient'

export default function SupportPage() {
  const { user } = useAuth()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SupportPageClient />
    </div>
  )
}