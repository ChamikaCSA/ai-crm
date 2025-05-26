import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BarChart3, PieChart } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SalesRepStats, Lead, LeadStatus } from '@/lib/api-types'
import { Progress } from '@/components/ui/progress'
import { getStatusColor, formatStatus } from '@/lib/lead-utils'

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

  const getTotalLeads = () => {
    if (!stats?.leadStatusBreakdown) return 0
    return Object.values(stats.leadStatusBreakdown).reduce((sum, count) => sum + (count || 0), 0)
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <PieChart className="w-6 h-6 text-[var(--primary)]" />
              Lead Status Breakdown
            </CardTitle>
            <div className="text-sm text-[var(--text-tertiary)]">
              Total: {getTotalLeads()} leads
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.leadStatusBreakdown && Object.entries(stats.leadStatusBreakdown).map(([status, count]) => {
              const percentage = count ? Math.round((count / getTotalLeads()) * 100) : 0;
              return (
                <div
                  key={status}
                  className="group flex items-center gap-4 p-2 rounded-lg hover:bg-[var(--accent)]/5 transition-colors"
                >
                  <div className="w-32">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {formatStatus(status)}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Progress
                        value={percentage}
                        className="h-2 group-hover:h-2.5 transition-all duration-200"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 min-w-[100px] text-sm">
                      <span className="font-medium">{count}</span>
                      <span className="text-[var(--text-tertiary)]">({percentage}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {formatStatus(lead.status)}
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