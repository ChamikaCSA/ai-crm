import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BarChart3, TrendingUp, Target, ArrowUp, ArrowDown, FileText, Calendar } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SalesManagerStats, TeamMember, SalesPipeline, Forecast, Report } from '@/lib/api-types'

interface DashboardSummary {
  pipeline: {
    totalValue: number;
    totalCount: number;
    averageDealSize: number;
    winRate: number;
  };
  forecasts: Array<{
    _id: string;
    metric: string;
    predictedValue: number;
    confidence: number;
    factors: {
      historicalTrend: number;
      seasonality: number;
      marketConditions: number;
      teamPerformance: number;
    };
    timestamp: string;
    predictionDate: string;
    date: string;
    value: number;
    accuracy: number;
    createdAt: string;
    updatedAt: string;
  }>;
  team: {
    totalTeamSize: number;
    activeReps: number;
    averagePerformance: number;
    topPerformers: Array<{
      name: string;
      performance: number;
      sales: number;
    }>;
  };
  reports: Array<{
    _id: string;
    type: string;
    format: string;
    name: string;
    description: string;
    parameters: {
      startDate: string;
      endDate: string;
      metrics: string[];
    };
    generatedAt: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export function SalesManagerDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get<DashboardSummary>('/api/sales-manager/dashboard/summary')
        setSummary(response)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading || !summary) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.team.activeReps}/{summary.team.totalTeamSize}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Active sales reps</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">Avg Performance: {summary.team.averagePerformance}%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${summary.pipeline.totalValue.toLocaleString()}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Total pipeline value</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">Total deals: {summary.pipeline.totalCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(summary.pipeline.winRate ?? 0).toFixed(1)}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">Current win rate</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-[var(--primary)]" />
              Avg Deal Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${summary.pipeline.averageDealSize.toLocaleString()}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Average deal size</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance and Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.team.topPerformers.map((member, index) => (
                <div
                  key={index}
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
                    <p className="text-[var(--text-tertiary)] mt-1">
                      Sales: ${member.sales.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/team">
                <Button variant="outline" size="sm" className="w-full">
                  View Team Performance
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-6 h-6 text-[var(--primary)]" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.reports.map((report) => (
                <div
                  key={report._id}
                  className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <p className="font-medium text-[var(--text-primary)]">
                        {report.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[var(--text-tertiary)]">
                        Type: {report.type}
                      </p>
                      <p className="text-[var(--text-tertiary)]">
                        Format: {report.format}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {report.description}
                    </p>
                  </div>
                  <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </time>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/reports">
                <Button variant="outline" size="sm" className="w-full">
                  View All Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}