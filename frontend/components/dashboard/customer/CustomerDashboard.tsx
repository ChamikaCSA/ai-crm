'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Clock, CheckCircle2, AlertCircle, Activity, Ticket, Sparkles } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { AccountDetails, SupportTicket, SupportTicketStatus, Recommendation } from '@/lib/api-types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProfilePicture } from '@/components/ProfilePicture'

export function CustomerDashboard() {
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [accountResponse, ticketsResponse, recommendationsResponse] = await Promise.all([
          api.get<AccountDetails>('/api/customer/account'),
          api.get<SupportTicket[]>('/api/customer/support-ticket'),
          api.get<Recommendation[]>('/api/customer/recommendation')
        ])

        setAccountDetails(accountResponse)
        setSupportTickets(Array.isArray(ticketsResponse) ? ticketsResponse : [])
        setRecommendations(Array.isArray(recommendationsResponse) ? recommendationsResponse : [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6 text-[var(--primary)]" />
            Account Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              {accountDetails && (
                <ProfilePicture user={{
                  ...accountDetails.user,
                  createdAt: new Date(accountDetails.user.createdAt),
                  updatedAt: new Date(accountDetails.user.updatedAt)
                }} size="lg" />
              )}
              <div>
                <h4 className="text-xl font-semibold text-[var(--text-primary)]">
                  {accountDetails?.user.firstName} {accountDetails?.user.lastName}
                </h4>
                <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-2">
                  {accountDetails?.user.email}
                  {accountDetails?.user.isEmailVerified && (
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
              <Clock className="w-4 h-4" />
              Last login: {accountDetails ? new Date(accountDetails.accountStatus.lastLogin).toLocaleDateString() : 'N/A'}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  accountDetails?.accountStatus.status === 'active'
                    ? 'bg-[var(--success)]/10 text-[var(--success)]'
                    : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                }`}
              >
                {accountDetails?.accountStatus.status === 'active' ? (
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-1" />
                )}
                {accountDetails?.accountStatus.status || 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-[var(--primary)]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountDetails?.recentInteractions.length === 0 ? (
              <div className="text-center text-[var(--text-tertiary)] py-8">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {accountDetails?.recentInteractions.slice(0, 3).map((interaction, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">
                        {interaction.type}
                      </p>
                      <p className="text-[var(--text-tertiary)]">
                        {interaction.description}
                      </p>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(interaction.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link href="/dashboard/account">
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Ticket className="w-6 h-6 text-[var(--primary)]" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supportTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <p className="text-[var(--text-tertiary)]">
                  You have no support tickets.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {supportTickets.slice(0, 3).map((ticket) => (
                  <div
                    key={ticket._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {ticket.subject}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            ticket.status === SupportTicketStatus.RESOLVED || ticket.status === SupportTicketStatus.CLOSED
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                          }`}
                        >
                          {ticket.status === SupportTicketStatus.RESOLVED || ticket.status === SupportTicketStatus.CLOSED ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[var(--text-tertiary)]">
                        <Clock className="w-3 h-3" />
                        <time className="text-xs">
                          Opened: {new Date(ticket.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link href="/dashboard/support">
                <Button variant="outline" size="sm" className="w-full">
                  View All Tickets
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-[var(--primary)]" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <p className="text-[var(--text-tertiary)]">
                No recommendations available at this time
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.slice(0, 2).map((rec, index) => (
                <div
                  key={`${rec.type}-${index}`}
                  className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors bg-[var(--card)]/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{rec.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{rec.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--primary)]">
                        {Math.round(rec.score * 100)}% match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/dashboard/recommendations">
              <Button variant="outline" size="sm" className="w-full">
                View All Recommendations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}