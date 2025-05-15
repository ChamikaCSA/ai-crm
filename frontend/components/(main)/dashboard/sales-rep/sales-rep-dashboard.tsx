import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BarChart3, ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SalesRepStats, Lead } from '@/lib/api-types'

export function SalesRepDashboard() {
  const [stats, setStats] = useState<SalesRepStats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, leadsResponse] = await Promise.all([
          api.get<SalesRepStats>('/api/sales-rep/stats'),
          api.get<{ data: Lead[] }>('/api/sales-rep/leads')
        ])

        setStats(statsResponse)
        setLeads(leadsResponse.data || [])
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Active Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeLeads || 0}</div>
            <p className="text-sm text-[var(--text-tertiary)]">
              +{stats?.lastWeekLeads || 0} from last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.conversionRate || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">
              {stats?.conversionRate && stats?.lastMonthConversionRate ? (
                stats.conversionRate > stats.lastMonthConversionRate ? (
                  `+${stats.conversionRate - stats.lastMonthConversionRate}% from last month`
                ) : (
                  `${stats.conversionRate - stats.lastMonthConversionRate}% from last month`
                )
              ) : (
                'No data from last month'
              )}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="w-6 h-6 text-[var(--primary)]" />
            Recent Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <p className="text-[var(--text-tertiary)]">
                  No recent leads
                </p>
              </div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead._id}
                  className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--text-primary)]">
                        {`${lead.firstName} ${lead.lastName}`}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.status === 'qualified' || lead.status === 'proposal'
                            ? 'bg-[var(--success)]/10 text-[var(--success)]'
                            : lead.status === 'contacted'
                            ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                            : 'bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)]'
                        }`}
                      >
                        {lead.status === 'qualified' || lead.status === 'proposal' ? (
                          <ArrowUp className="w-3 h-3 mr-1" />
                        ) : lead.status === 'contacted' ? (
                          <ArrowUp className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 mr-1" />
                        )}
                        {lead.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[var(--text-tertiary)]">
                        {lead.company || 'No company'}
                      </p>
                      <p className="text-[var(--text-tertiary)]">
                        {lead.email}
                      </p>
                    </div>
                  </div>
                  <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                    Created: {new Date(lead.createdAt).toLocaleDateString()}
                  </time>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link href="/dashboard/leads">
              <Button variant="outline" size="sm" className="w-full">
                View All Leads
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}