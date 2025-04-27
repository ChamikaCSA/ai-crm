import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BarChart3, TrendingUp, Target, ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SalesManagerStats, TeamMember, SalesPipeline } from '@/lib/api-types'

export function SalesManagerDashboard() {
  const [stats, setStats] = useState<SalesManagerStats | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pipeline, setPipeline] = useState<SalesPipeline[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, teamResponse, pipelineResponse] = await Promise.all([
          api.get<SalesManagerStats>('/api/sales-manager/stats'),
          api.get<TeamMember[]>('/api/sales-manager/team'),
          api.get<SalesPipeline[]>('/api/sales-manager/pipeline')
        ])

        setStats(statsResponse)
        setTeamMembers(Array.isArray(teamResponse) ? teamResponse : [])
        setPipeline(Array.isArray(pipelineResponse) ? pipelineResponse : [])
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.teamSize || 0}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Active sales reps</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.teamPerformance || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">Of target achieved</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(stats?.revenue || 0).toLocaleString()}</div>
            <p className="text-sm text-[var(--text-tertiary)]">This month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-[var(--primary)]" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.conversionRate || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">Team average</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No team members available
                  </p>
                </div>
              ) : (
                teamMembers.slice(0, 5).map((member) => (
                  <div
                    key={member._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {member.name}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.performance >= 90
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : member.performance >= 70
                              ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                              : 'bg-[var(--error)]/10 text-[var(--error)]'
                          }`}
                        >
                          {member.performance >= 90 ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : member.performance >= 70 ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 mr-1" />
                          )}
                          {member.performance}% performance
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[var(--text-tertiary)]">
                          Role: {member.role}
                        </p>
                        <p className="text-[var(--text-tertiary)]">
                          Sales: ${member.sales.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      Last active: {new Date(member.lastActive).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/sales-manager/team">
                <Button variant="outline" size="sm" className="w-full">
                  View All Team Members
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-[var(--primary)]" />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipeline.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No pipeline data available
                  </p>
                </div>
              ) : (
                pipeline.slice(0, 5).map((stage) => (
                  <div
                    key={stage._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {stage.stage}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            stage.conversionRate >= 50
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : stage.conversionRate >= 30
                              ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                              : 'bg-[var(--error)]/10 text-[var(--error)]'
                          }`}
                        >
                          {stage.conversionRate >= 50 ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : stage.conversionRate >= 30 ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 mr-1" />
                          )}
                          {stage.conversionRate}% conversion
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[var(--text-tertiary)]">
                          Count: {stage.count}
                        </p>
                        <p className="text-[var(--text-tertiary)]">
                          Value: ${stage.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      Updated: {new Date(stage.lastUpdated).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/sales-manager/pipeline">
                <Button variant="outline" size="sm" className="w-full">
                  View Full Pipeline
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}